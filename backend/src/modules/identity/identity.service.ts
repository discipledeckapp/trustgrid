/**
 * IdentityService — Privacy-First Verification
 * See design notes in identity.service.ts header for full privacy model.
 */
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common'
import { createHash } from 'crypto'   // still used for photo hashing (not NIN)
import { PrismaService } from '../../prisma/prisma.service'
import { TrustScoreService } from '../trust-score/trust-score.service'
import { IdentityAdapterRegistry } from '../../common/adapters/identity-adapter.registry'
import { AmazonRekognitionAdapter } from '../../common/adapters/amazon-rekognition.adapter'
import { PremblyCACAdapter } from '../../common/adapters/prembly-cac.adapter'
import { EncryptionService } from '../../common/encryption/encryption.service'
import { VerificationLevel } from '../../common/adapters/identity-provider.adapter'

export interface InitiateVerificationDto {
  idType: string
  idNumber: string
  firstName: string
  lastName: string
  livePhotoBase64?: string   // live selfie (all pathways)
  livenessSessionId?: string // Rekognition session ID (pathway 1 only)
}

export interface CACVerifyDto {
  rcNumber: string
  companyType?: 'BN' | 'RC' | 'IT' | 'LL' | 'LLP'
}

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScore: TrustScoreService,
    private readonly adapterRegistry: IdentityAdapterRegistry,
    private readonly rekognition: AmazonRekognitionAdapter,
    private readonly cacAdapter: PremblyCACAdapter,
    private readonly encryption: EncryptionService,
  ) {}

  // ── Liveness ──────────────────────────────────────────────────────────────

  async createLivenessSession() {
    if (!this.rekognition.isConfigured()) {
      return { available: false, message: 'Liveness not configured. Use photo upload.' }
    }
    const session = await this.rekognition.createLivenessSession()
    if (!session) return { available: false, message: 'Could not start liveness session.' }
    return { available: true, sessionId: session.sessionId }
  }

  async getLivenessStatus(sessionId: string) {
    if (!this.rekognition.isConfigured()) return { available: false }
    return this.rekognition.getLivenessResult(sessionId)
  }

  // ── Photo upload (all pathways — even unverified workers get a photo) ──────

  async uploadWorkerPhoto(
    workerId: string,
    institutionId: string,
    photoBase64: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
    })
    if (!worker) throw new NotFoundException('Worker not found')
    this.assertCanManageWorker(worker.userId, requesterId, requesterRole)

    await this.prisma.workerProfile.update({
      where: { id: workerId },
      data: {
        profilePhotoEncrypted: this.encryption.encrypt(photoBase64),
        profilePhotoHash: createHash('sha256').update(photoBase64).digest('hex'),
      },
    })

    return { stored: true }
  }

  // ── Main verification flow ─────────────────────────────────────────────────

  async initiateVerification(
    workerId: string,
    institutionId: string,
    dto: InitiateVerificationDto,
    requesterId: string,
    requesterRole: string,
  ) {
    const [worker, institution] = await Promise.all([
      this.prisma.workerProfile.findFirst({ where: { id: workerId, institutionId } }),
      this.prisma.institution.findUnique({ where: { id: institutionId }, select: { country: true } }),
    ])
    if (!worker) throw new NotFoundException('Worker not found')
    this.assertCanManageWorker(worker.userId, requesterId, requesterRole)

    const country = institution?.country ?? 'NG'
    const adapter = this.adapterRegistry.getAdapter(country)

    if (!adapter.validateIdFormat(dto.idNumber, dto.idType)) {
      throw new BadRequestException(
        `Invalid ${dto.idType} format. Example: ${adapter.getSupportedDocumentTypes().find(d => d.code === dto.idType)?.example ?? 'check docs'}`
      )
    }

    // Deduplication — HMAC-SHA256 (rainbow-table resistant) via EncryptionService
    const idHash = this.encryption.hashIdNumber(dto.idNumber)
    const dup = await this.prisma.identityVerification.findFirst({
      where: { idNumberHash: idHash, status: { in: ['FULLY_VERIFIED', 'PARTIALLY_VERIFIED'] } },
    })
    if (dup && dup.workerId !== workerId) {
      throw new BadRequestException('This identity document is already linked to another account.')
    }

    // ── Resolve live photo ──────────────────────────────────────────────────
    let livePhoto = dto.livePhotoBase64
    let pathway = livePhoto ? 'photo_upload' : 'no_photo'
    let livenessConfidence: number | undefined

    if (dto.livenessSessionId && this.rekognition.isConfigured()) {
      const liveness = await this.rekognition.getLivenessResult(dto.livenessSessionId)
      if (liveness.isLive && liveness.referenceImageBase64) {
        livePhoto = liveness.referenceImageBase64
        livenessConfidence = liveness.confidence
        pathway = 'liveness_verified'
      }
    }

    // ── Store live photo for ALL workers regardless of verification outcome ──
    if (livePhoto) {
      await this.prisma.workerProfile.update({
        where: { id: workerId },
        data: {
          profilePhotoEncrypted: this.encryption.encrypt(livePhoto),
          profilePhotoHash: createHash('sha256').update(livePhoto).digest('hex'),
        },
      })
      this.logger.log({ workerId, pathway }, 'live_photo_stored')
    }

    // ── Create/reset verification record ───────────────────────────────────
    const verification = await this.prisma.identityVerification.upsert({
      where: { workerId },
      create: {
        workerId,
        providerName: adapter.providerCode,
        countryCode: country,
        idNumber: this.encryption.encrypt(dto.idNumber),
        idNumberHash: idHash,
        status: 'PENDING',
      },
      update: {
        providerName: adapter.providerCode,
        idNumber: this.encryption.encrypt(dto.idNumber),
        idNumberHash: idHash,
        status: 'PENDING',
        failureReason: null,
      },
    })

    // ── Run async ────────────────────────────────────────────────────────────
    this.runVerification({
      verificationId: verification.id,
      workerId, institutionId, adapter,
      idType: dto.idType, idNumber: dto.idNumber,
      firstName: dto.firstName, lastName: dto.lastName,
      livePhotoBase64: livePhoto, livenessConfidence, pathway,
    }).catch(err => this.logger.error({ err, workerId }, 'async_verification_failed'))

    return {
      verificationId: verification.id,
      status: 'PENDING',
      pathway,
      provider: adapter.providerName,
      isAutomated: this.adapterRegistry.isAutomatedCountry(country),
      livePhotoStored: !!livePhoto,
      encryptionEnabled: this.encryption.isEnabled(),
      message: this.adapterRegistry.isAutomatedCountry(country)
        ? 'Verification in progress — check status in a few seconds.'
        : 'Documents submitted for manual review by institution administrator.',
    }
  }

  private async runVerification(params: {
    verificationId: string; workerId: string; institutionId: string; adapter: any
    idType: string; idNumber: string; firstName: string; lastName: string
    livePhotoBase64?: string; livenessConfidence?: number; pathway: string
  }) {
    const { verificationId, workerId, institutionId, adapter, pathway } = params

    const result = await adapter.verify({
      idType: params.idType, idNumber: params.idNumber,
      firstName: params.firstName, lastName: params.lastName,
      selfieImageBase64: params.livePhotoBase64,
    })

    // Map to DB status
    let dbStatus: string
    if (!result.success) {
      dbStatus = ['MANUAL_REVIEW_REQUIRED', 'PROVIDER_NOT_CONFIGURED'].includes(result.failureCode)
        ? 'UNVERIFIED' : 'VERIFICATION_FAILED'
    } else {
      dbStatus = result.verificationLevel >= VerificationLevel.BIOMETRIC_CONFIRMED
        ? 'FULLY_VERIFIED'
        : result.verificationLevel >= VerificationLevel.IDENTITY_CONFIRMED
          ? 'PARTIALLY_VERIFIED'
          : 'UNVERIFIED'
    }

    // Extract biographic data — only name, DOB, gender (data minimisation)
    const bio = result.success ? adapter.extractBiographicData(result) : null
    let encLegalName: string | undefined
    let encDOB: string | undefined
    let encGender: string | undefined

    if (bio) {
      const fullName = [bio.firstName, bio.middleName, bio.lastName].filter(Boolean).join(' ').trim()
      if (fullName) encLegalName = this.encryption.encrypt(fullName)
      if (bio.dateOfBirth) encDOB = this.encryption.encrypt(bio.dateOfBirth.toISOString())
      if (bio.gender) encGender = this.encryption.encrypt(bio.gender)
      // bio.photoUrl = NIMC photo → NOT stored. Live selfie already stored separately.
    }

    await this.prisma.identityVerification.update({
      where: { id: verificationId },
      data: {
        status: dbStatus as any,
        verifiedAt: result.success ? new Date() : null,
        failureReason: result.failureMessage ?? null,
        providerReference: (result.rawProviderResponse as any)?.verification?.reference ?? null,
        verifiedLegalName: encLegalName,
        verifiedDOB: encDOB,
        verifiedGender: encGender,
        faceMatchScore: result.faceMatchScore ?? null,
        faceMatchPassed: result.faceMatchPassed ?? null,
      },
    })

    await this.prisma.workerProfile.update({
      where: { id: workerId },
      data: { verificationStatus: dbStatus as any },
    })

    if (result.success) {
      await this.trustScore.emitEvent({
        type: 'IDENTITY_VERIFIED', workerId, institutionId,
        referenceType: 'identity_verification', referenceId: verificationId,
        metadata: { level: result.verificationLevel, pathway, livenessConfidence: params.livenessConfidence },
      })
    }

    this.logger.log({
      workerId, dbStatus, pathway, automated: result.success,
      faceMatch: result.faceMatchPassed, faceScore: result.faceMatchScore?.toFixed(1),
    }, 'verification_completed')
  }

  // ── Consent-gated identity disclosure ─────────────────────────────────────

  async getVerifiedDetails(workerId: string, institutionId: string, requesterRole: string) {
    const authorized = ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'PLATFORM_ADMIN'].includes(requesterRole)

    const [verification, worker] = await Promise.all([
      this.prisma.identityVerification.findFirst({
        where: { workerId },
        select: {
          status: true, verifiedAt: true, failureReason: true, providerName: true,
          faceMatchPassed: true, faceMatchScore: true,
          verifiedLegalName: true, verifiedDOB: true, verifiedGender: true,
        },
      }),
      this.prisma.workerProfile.findFirst({
        where: { id: workerId, institutionId },
        select: { verificationStatus: true, trustScore: true, profilePhotoEncrypted: true },
      }),
    ])

    if (!worker) return null

    const base = {
      verificationStatus: worker.verificationStatus,
      trustScore: worker.trustScore,
      hasLivePhoto: !!worker.profilePhotoEncrypted,
      faceMatchPassed: verification?.faceMatchPassed,
      faceMatchScore: verification?.faceMatchScore,
      verifiedAt: verification?.verifiedAt,
      providerName: verification?.providerName,
    }

    if (!authorized) return base

    // Decrypt PII for authorised institution operators
    let legalName: string | null = null
    let birthYear: number | null = null
    let gender: string | null = null

    if (verification?.verifiedLegalName) {
      legalName = this.encryption.decrypt(verification.verifiedLegalName)
    }
    if (verification?.verifiedDOB) {
      const dobStr = this.encryption.decrypt(verification.verifiedDOB)
      if (dobStr) {
        const d = new Date(dobStr)
        if (!isNaN(d.getTime())) birthYear = d.getFullYear()
      }
    }
    if (verification?.verifiedGender) {
      gender = this.encryption.decrypt(verification.verifiedGender)
    }

    return { ...base, legalName, birthYear, gender }
  }

  async getWorkerPhoto(
    workerId: string,
    institutionId: string,
    requesterRole: string,
    requesterId: string,
  ) {
    const authorized = ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'PLATFORM_ADMIN', 'WORKER']
      .includes(requesterRole)
    if (!authorized) return null

    const w = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
      select: { userId: true, profilePhotoEncrypted: true },
    })
    if (requesterRole === 'WORKER' && w?.userId !== requesterId) return null
    if (!w?.profilePhotoEncrypted) return null
    return this.encryption.decrypt(w.profilePhotoEncrypted)
  }

  private assertCanManageWorker(workerUserId: string, requesterId: string, requesterRole: string) {
    if (['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'PLATFORM_ADMIN'].includes(requesterRole)) return
    if (requesterRole === 'WORKER' && workerUserId === requesterId) return
    throw new ForbiddenException('You cannot update this worker profile')
  }

  // ── CAC ───────────────────────────────────────────────────────────────────

  async verifyOrganisationCAC(
    organisationId: string,
    institutionId: string,
    dto: CACVerifyDto & { representativeNin?: string },
  ) {
    const org = await this.prisma.organisation.findFirst({ where: { id: organisationId, institutionId } })
    if (!org) throw new NotFoundException('Organisation not found')

    const result = await this.cacAdapter.verify({ rcNumber: dto.rcNumber, companyType: dto.companyType ?? 'RC' })
    const newStatus = result.verified ? 'PARTIALLY_VERIFIED' : 'UNVERIFIED'

    // ── Cross-reference representative against CAC directors ──────────────
    // If a representative NIN is provided AND CAC returned directors,
    // we check whether the NIN hash matches any director in the list.
    // This answers: "Is this person authorised to represent this company?"
    let representativeIsDirector: boolean | null = null
    let representativeNinHash: string | null = null
    let encryptedDirectors: string | null = null

    if (dto.representativeNin && result.directors && result.directors.length > 0) {
      representativeNinHash = this.encryption.hashIdNumber(dto.representativeNin)
      encryptedDirectors = this.encryption.encrypt(JSON.stringify(result.directors))

      // We cannot directly compare NIN hashes to director names from CAC
      // (CAC returns names, not NINs). The authorisation check therefore works as:
      //   1. If rep claims to be a director → they upload their NIN
      //   2. Institution admin reviews the director list and confirms the name matches
      //   3. OR: rep provides an authorisation letter signed by a listed director
      // Full automated cross-referencing requires a CAC-NIN lookup API (future integration).
      // For now: flag as "pending director confirmation" if not self-confirmed.
      representativeIsDirector = null // null = pending manual confirmation
    }

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        verificationStatus: newStatus as any,
        rcNumber: dto.rcNumber,
        representativeNinHash,
        representativeIsDirector,
        cacDirectors: encryptedDirectors,
      },
    })

    return {
      status: newStatus,
      verified: result.verified,
      companyName: result.companyName,
      companyStatus: result.companyStatus,
      directors: result.directors,  // returned to admin for manual review
      representativeAuthorisation: representativeNinHash
        ? 'PENDING_DIRECTOR_CONFIRMATION'
        : 'NOT_CHECKED',
      message: result.verified
        ? `${result.companyName} verified against CAC records.${representativeNinHash ? ' Representative authorisation pending manual director confirmation.' : ''}`
        : `Could not confirm RC ${dto.rcNumber}. Organisation flagged as unverified — onboarding continues.`,
      nextStep: result.verified && !representativeIsDirector
        ? 'Institution admin should review the CAC director list and confirm the representative is authorised, OR request an authorisation letter.'
        : undefined,
    }
  }

  // ── Status polling ────────────────────────────────────────────────────────

  async getVerificationStatus(workerId: string, institutionId: string) {
    const [v, w] = await Promise.all([
      this.prisma.identityVerification.findFirst({
        where: { workerId },
        select: { id: true, status: true, verifiedAt: true, failureReason: true, providerName: true, faceMatchPassed: true, faceMatchScore: true },
      }),
      this.prisma.workerProfile.findFirst({
        where: { id: workerId, institutionId },
        select: { verificationStatus: true, trustScore: true, profilePhotoEncrypted: true },
      }),
    ])
    return {
      verification: v,
      workerStatus: w?.verificationStatus,
      trustScore: w?.trustScore,
      hasLivePhoto: !!w?.profilePhotoEncrypted,
      isVerified: ['FULLY_VERIFIED', 'PARTIALLY_VERIFIED'].includes(w?.verificationStatus ?? ''),
    }
  }

  async getSupportedIdTypes(countryCode: string) {
    const adapter = this.adapterRegistry.getAdapter(countryCode)
    return {
      provider: adapter.providerName,
      isAutomated: this.adapterRegistry.isAutomatedCountry(countryCode),
      supportedTypes: adapter.getSupportedDocumentTypes(),
      livenessAvailable: this.rekognition.isConfigured(),
      encryptionEnabled: this.encryption.isEnabled(),
    }
  }
}
