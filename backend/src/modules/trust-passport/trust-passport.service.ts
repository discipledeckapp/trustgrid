/**
 * TrustPassportService — The Flagship Product Capability
 *
 * Every person and organization in TrustGrid receives a Trust Passport.
 * The passport aggregates:
 *   - Verified identity
 *   - Community memberships
 *   - Authority roles held
 *   - Trust credentials issued by community nodes
 *   - Endorsements with their authority chain
 *   - Trust score + grade
 *   - Assignment history
 *
 * The passport is:
 *   - Digital (accessible via dashboard)
 *   - Publicly verifiable (QR → verify.trustgrid.ng/TGP-XXXXX)
 *   - API-accessible (external systems can verify credentials)
 *   - Printable (as PDF)
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { EncryptionService } from '../../common/encryption/encryption.service'
import { TrustScoreService } from '../trust-score/trust-score.service'

// Passport code format: TGP-XXXXX (8 alphanumeric chars, URL-safe)
function generatePassportCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // no ambiguous chars (0,O,1,I)
  let code = 'TGP-'
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

@Injectable()
export class TrustPassportService {
  private readonly logger = new Logger(TrustPassportService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly trustScore: TrustScoreService,
  ) {}

  // ── Create or get passport ────────────────────────────────────────────────

  async getOrCreatePassport(userId: string, institutionId: string) {
    const existing = await this.prisma.trustPassport.findUnique({
      where: { userId },
    })
    if (existing) return existing

    // Generate a unique passport code
    let passportCode: string
    let attempts = 0
    do {
      passportCode = generatePassportCode()
      attempts++
      if (attempts > 10) throw new Error('Could not generate unique passport code')
    } while (await this.prisma.trustPassport.findUnique({ where: { passportCode } }))

    const verifyUrl = `https://verify.trustgrid.ng/${passportCode}`

    const passport = await this.prisma.trustPassport.create({
      data: {
        passportCode,
        userId,
        institutionId,
        verifyUrl,
        isPublic: true,
        status: 'ACTIVE',
      },
    })

    this.logger.log({ userId, passportCode }, 'trust_passport_created')
    return passport
  }

  // ── Issue a Trust Credential ──────────────────────────────────────────────

  async issueCredential(params: {
    passportId: string
    credentialType: string
    label: string
    description?: string
    category?: string
    issuingNodeId?: string
    issuingUserId: string
    issuingRoleName?: string
    expiresAt?: Date
    metadata?: Record<string, unknown>
    institutionId: string
  }) {
    const passport = await this.prisma.trustPassport.findUnique({
      where: { id: params.passportId },
    })
    if (!passport) throw new NotFoundException('Passport not found')

    const verifyUrl = `${passport.verifyUrl}/credentials/${params.credentialType.toLowerCase().replace(/_/g, '-')}`

    const credential = await this.prisma.trustCredential.create({
      data: {
        passportId: params.passportId,
        institutionId: params.institutionId,
        credentialType: params.credentialType,
        label: params.label,
        description: params.description,
        category: params.category,
        issuingNodeId: params.issuingNodeId,
        issuingUserId: params.issuingUserId,
        issuingRoleName: params.issuingRoleName,
        expiresAt: params.expiresAt,
        metadata: (params.metadata ?? {}) as any,
        verifyUrl,
        status: 'ACTIVE',
      },
    })

    // Update credential count on passport
    await this.prisma.trustPassport.update({
      where: { id: params.passportId },
      data: { credentialCount: { increment: 1 } },
    })

    // Emit trust event
    const worker = await this.prisma.workerProfile.findFirst({
      where: { userId: passport.userId, institutionId: params.institutionId },
    })
    if (worker) {
      await this.trustScore.emitEvent({
        type: 'CREDENTIAL_VERIFIED',
        workerId: worker.id,
        institutionId: params.institutionId,
        referenceType: 'trust_credential',
        referenceId: credential.id,
        createdBy: params.issuingUserId,
      })
    }

    this.logger.log({
      passportId: params.passportId,
      credentialType: params.credentialType,
      issuedBy: params.issuingUserId,
    }, 'trust_credential_issued')

    return credential
  }

  async revokeCredential(credentialId: string, revokedById: string, reason: string) {
    const credential = await this.prisma.trustCredential.findUnique({
      where: { id: credentialId },
    })
    if (!credential) throw new NotFoundException('Credential not found')

    const updated = await this.prisma.trustCredential.update({
      where: { id: credentialId },
      data: { status: 'REVOKED', revokedAt: new Date(), revokedById, },
    })

    await this.prisma.trustPassport.update({
      where: { id: credential.passportId },
      data: { credentialCount: { decrement: 1 } },
    })

    return updated
  }

  // ── Get full passport (the complete Trust Passport view) ──────────────────

  async getFullPassport(userId: string, institutionId: string, requesterRole?: string) {
    const passport = await this.getOrCreatePassport(userId, institutionId)

    const [credentials, memberships, authorityAssignments, worker, identityVerification] = await Promise.all([
      this.prisma.trustCredential.findMany({
        where: { passportId: passport.id, status: 'ACTIVE' },
        include: { issuingNode: { select: { id: true, name: true } } },
        orderBy: { issuedAt: 'desc' },
      }),
      this.prisma.membership.findMany({
        where: { userId, institutionId, status: 'ACTIVE' },
        include: { node: { select: { id: true, name: true, type: { select: { name: true } } } } },
        orderBy: { joinedAt: 'asc' },
      }),
      this.prisma.authorityAssignment.findMany({
        where: { userId, institutionId, status: 'ACTIVE' },
        include: {
          role: true,
          node: { select: { id: true, name: true, type: { select: { name: true } } } },
        },
      }),
      this.prisma.workerProfile.findFirst({
        where: { userId, institutionId },
        include: {
          user: { select: { firstName: true, lastName: true, profilePhotoUrl: true } },
          endorsementsReceived: { where: { isActive: true }, take: 10 },
          performanceReviews: { take: 5, orderBy: { createdAt: 'desc' } },
          incidents: { where: { status: { not: 'RESOLVED' } }, take: 3 },
        },
      }),
      this.prisma.identityVerification.findFirst({
        where: { workerId: (await this.prisma.workerProfile.findFirst({ where: { userId, institutionId }, select: { id: true } }))?.id ?? '' },
        select: { status: true, verifiedAt: true, faceMatchPassed: true, providerName: true },
      }),
    ])

    // Primary community = first active membership
    const primaryMembership = memberships[0]
    const primaryRole = authorityAssignments
      .sort((a, b) => b.role.level - a.role.level)[0]

    // Compute trust score breakdown
    let trustScoreData = null
    if (worker) {
      try {
        trustScoreData = await this.trustScore.getScoreBreakdown(worker.id, institutionId)
      } catch {}
    }

    // Decrypt legal name if available and requester is authorised
    let verifiedLegalName: string | null = null
    const identityFull = await this.prisma.identityVerification.findFirst({
      where: { workerId: worker?.id ?? '' },
      select: { verifiedLegalName: true, verifiedDOB: true },
    })
    if (identityFull?.verifiedLegalName) {
      const canSeePrivate = ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'PLATFORM_ADMIN'].includes(requesterRole ?? '')
      if (canSeePrivate) {
        verifiedLegalName = this.encryption.decrypt(identityFull.verifiedLegalName)
      }
    }

    return {
      passport: {
        id: passport.id,
        passportCode: passport.passportCode,
        verifyUrl: passport.verifyUrl,
        status: passport.status,
        issuedAt: passport.issuedAt,
        expiresAt: passport.expiresAt,
      },
      identity: {
        displayName: worker ? `${worker.user.firstName} ${worker.user.lastName}` : 'Unknown',
        verifiedLegalName,   // only for authorised viewers
        profilePhotoUrl: worker?.user.profilePhotoUrl,
        idVerified: identityVerification?.status === 'FULLY_VERIFIED' || identityVerification?.status === 'PARTIALLY_VERIFIED',
        idVerifiedAt: identityVerification?.verifiedAt,
        faceMatchPassed: identityVerification?.faceMatchPassed,
      },
      community: {
        primaryCommunity: primaryMembership?.node?.name,
        primaryCommunityType: primaryMembership?.node?.type?.name,
        memberships: memberships.map(m => ({
          nodeId: m.nodeId,
          nodeName: m.node.name,
          nodeType: m.node.type.name,
          type: m.type,
          verificationLevel: m.verificationLevel,
          joinedAt: m.joinedAt,
        })),
      },
      authority: {
        hasAuthority: authorityAssignments.length > 0,
        primaryRole: primaryRole ? {
          roleName: primaryRole.role.name,
          nodeName: primaryRole.node.name,
          level: primaryRole.role.level,
          expiresAt: primaryRole.expiresAt,
        } : null,
        allRoles: authorityAssignments.map(a => ({
          roleName: a.role.name,
          nodeName: a.node.name,
          nodeType: a.node.type.name,
          level: a.role.level,
        })),
      },
      credentials,
      trustScore: trustScoreData ?? { score: worker?.trustScore ?? 0, grade: 'F' },
      reputation: worker ? {
        totalDeployments:     worker.totalDeployments,
        completedDeployments: worker.completedDeployments,
        averageRating:        worker.averageRating,
        totalEndorsements:    worker.totalEndorsements,
        endorsements:         worker.endorsementsReceived,
        recentReviews:        worker.performanceReviews,
        openIncidents:        worker.incidents.length,
      } : null,
    }
  }

  // ── Public verification (no auth — for QR scan) ───────────────────────────

  async verifyByCode(passportCode: string) {
    const passport = await this.prisma.trustPassport.findUnique({
      where: { passportCode },
      include: {
        credentials: {
          where: { status: 'ACTIVE' },
          select: { credentialType: true, label: true, expiresAt: true, issuedAt: true, status: true },
        },
      },
    })

    if (!passport) {
      return {
        valid: false,
        message: 'Passport not found. This QR code may be invalid or expired.',
      }
    }

    if (!passport.isPublic) {
      return {
        valid: true,
        passportCode,
        status: passport.status,
        message: 'This passport is set to private by the holder.',
        isPrivate: true,
      }
    }

    // Get basic info (no PII — no name, no address, no phone)
    const worker = await this.prisma.workerProfile.findFirst({
      where: { userId: passport.userId, institutionId: passport.institutionId },
      select: {
        trustScore: true,
        verificationStatus: true,
        primarySkill: true,
        totalDeployments: true,
        averageRating: true,
        totalEndorsements: true,
        user: { select: { firstName: true, lastName: true } },
      },
    })

    const memberships = await this.prisma.membership.findMany({
      where: { userId: passport.userId, institutionId: passport.institutionId, status: 'ACTIVE' },
      include: { node: { select: { name: true, type: { select: { name: true } } } } },
      take: 3,
    })

    const trustGrade = this.trustScore.getGrade(worker?.trustScore ?? 0)

    return {
      valid: true,
      passportCode,
      status: passport.status,
      lastVerifiedAt: passport.lastVerifiedAt ?? passport.issuedAt,

      // Display name only (first + last initial for privacy)
      displayName: worker ? `${worker.user.firstName} ${worker.user.lastName[0]}.` : 'Member',
      primarySkill: worker?.primarySkill,

      trustScore: {
        score: worker?.trustScore ?? 0,
        grade: trustGrade.grade,
        label: trustGrade.label,
        color: trustGrade.color,
      },

      idVerified: ['FULLY_VERIFIED', 'PARTIALLY_VERIFIED'].includes(worker?.verificationStatus ?? ''),
      biometricVerified: worker?.verificationStatus === 'FULLY_VERIFIED',

      primaryCommunity: memberships[0]?.node?.name,
      communityType:    memberships[0]?.node?.type?.name,
      activeCommunities: memberships.length,

      credentials: passport.credentials.map(c => ({
        type: c.credentialType,
        label: c.label,
        status: c.status,
        validUntil: c.expiresAt,
      })),

      reputation: {
        jobsCompleted:    worker?.totalDeployments ?? 0,
        averageRating:    worker?.averageRating,
        endorsements:     worker?.totalEndorsements ?? 0,
      },

      issuedAt: passport.issuedAt,
      expiresAt: passport.expiresAt,
    }
  }

  async getMyPassport(userId: string, institutionId: string) {
    return this.getFullPassport(userId, institutionId, 'WORKER')
  }

  async updatePassportStats(passportId: string, score: number, grade: string, credentialCount: number, endorsementCount: number, primaryCommunity: string | null) {
    return this.prisma.trustPassport.update({
      where: { id: passportId },
      data: {
        trustScore: score,
        trustGrade: grade,
        credentialCount,
        endorsementCount,
        primaryCommunity,
        lastVerifiedAt: new Date(),
      },
    })
  }
}
