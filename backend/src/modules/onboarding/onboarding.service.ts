import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { TrustScoreService } from '../trust-score/trust-score.service'
import { EncryptionService } from '../../common/encryption/encryption.service'
import { ZeptomailService } from '../../common/email/zeptomail.service'

// ─── Step DTOs ────────────────────────────────────────────────────────────────

export interface StartWorkerOnboardingDto {
  phone: string
  firstName: string
  lastName: string
  email?: string
  profilePhotoBase64?: string
}

export interface WorkerSkillsStepDto {
  applicationId: string
  primarySkill: string
  skills: string[]
  categoryIds: string[]
  yearsExperience?: number
  hourlyRate?: number
  dailyRate?: number
  bio?: string
}

export interface WorkerVerificationStepDto {
  applicationId: string
  idType: string
  idNumber: string
}

export interface WorkerAvailabilityStepDto {
  applicationId: string
  serviceZoneIds: string[]
  availabilityNotes?: string
  isAvailable?: boolean
}

export interface StartOrgOnboardingDto {
  phone: string
  contactName: string
  email?: string
  organisationName: string
  organisationType: string
  rcNumber?: string
}

export interface OrgServicesStepDto {
  applicationId: string
  serviceCategories: string[]
  serviceZoneIds: string[]
  description?: string
}

export interface OrgTeamStepDto {
  applicationId: string
  branches?: Array<{
    name: string
    address: string
    city?: string
    managerName?: string
    managerPhone?: string
  }>
}

export interface ReviewApplicationDto {
  decision: 'APPROVE' | 'REJECT' | 'NEEDS_MORE_INFO'
  notes?: string
  rejectionReason?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScoreService: TrustScoreService,
    private readonly encryption: EncryptionService,
    private readonly email: ZeptomailService,
  ) {}

  // ── Individual Worker Flow ──────────────────────────────────────────────────

  async startWorkerOnboarding(dto: StartWorkerOnboardingDto, institutionId: string) {
    const existing = await this.prisma.onboardingApplication.findFirst({
      where: { phone: dto.phone, institutionId, type: 'INDIVIDUAL_WORKER' },
    })
    if (existing) {
      return { applicationId: existing.id, status: existing.status, stepCompleted: existing.stepCompleted, message: 'Resuming existing application' }
    }

    const app = await this.prisma.onboardingApplication.create({
      data: {
        institutionId,
        type: 'INDIVIDUAL_WORKER',
        status: 'DRAFT',
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        stepCompleted: 1,
        formData: { step1: { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone, email: dto.email } },
      },
    })

    return { applicationId: app.id, status: app.status, stepCompleted: 1, message: 'Step 1 complete. Tell us about your skills.' }
  }

  async saveWorkerSkills(dto: WorkerSkillsStepDto, institutionId: string) {
    const app = await this.getApplication(dto.applicationId, institutionId)
    this.assertStep(app, 1)

    const existing = app.formData as Record<string, unknown>
    const updated = await this.prisma.onboardingApplication.update({
      where: { id: dto.applicationId },
      data: {
        primarySkill: dto.primarySkill,
        stepCompleted: 2,
        formData: {
          ...existing,
          step2: {
            primarySkill: dto.primarySkill,
            skills: dto.skills,
            categoryIds: dto.categoryIds,
            yearsExperience: dto.yearsExperience,
            hourlyRate: dto.hourlyRate,
            dailyRate: dto.dailyRate,
            bio: dto.bio,
          },
        },
      },
    })

    return { applicationId: updated.id, stepCompleted: 2, message: 'Step 2 complete. Now verify your identity.' }
  }

  async saveWorkerVerification(dto: WorkerVerificationStepDto, institutionId: string) {
    const app = await this.getApplication(dto.applicationId, institutionId)
    this.assertStep(app, 2)

    const existing = app.formData as Record<string, unknown>
    const updated = await this.prisma.onboardingApplication.update({
      where: { id: dto.applicationId },
      data: {
        stepCompleted: 3,
        formData: {
          ...existing,
          step3: {
            idType: dto.idType,
            idNumberEncrypted: this.encryption.encrypt(dto.idNumber),
            idNumberHash: this.encryption.hashIdNumber(dto.idNumber),
            status: 'PENDING',
          },
        },
      },
    })

    return { applicationId: updated.id, stepCompleted: 3, message: 'Identity verification submitted. Upload your credentials next.' }
  }

  async saveWorkerCredentials(applicationId: string, institutionId: string, credentials: Array<{ type: string; name: string }>) {
    const app = await this.getApplication(applicationId, institutionId)
    this.assertStep(app, 3)

    const existing = app.formData as Record<string, unknown>
    const updated = await this.prisma.onboardingApplication.update({
      where: { id: applicationId },
      data: {
        stepCompleted: 4,
        formData: { ...existing, step4: { credentials } },
      },
    })

    return { applicationId: updated.id, stepCompleted: 4, message: 'Credentials saved. Final step — set your availability.' }
  }

  async saveWorkerAvailability(dto: WorkerAvailabilityStepDto, institutionId: string) {
    const app = await this.getApplication(dto.applicationId, institutionId)
    this.assertStep(app, 4)

    const existing = app.formData as Record<string, unknown>
    const updated = await this.prisma.onboardingApplication.update({
      where: { id: dto.applicationId },
      data: {
        stepCompleted: 5,
        status: 'SUBMITTED',
        formData: { ...existing, step5: { serviceZoneIds: dto.serviceZoneIds, availabilityNotes: dto.availabilityNotes } },
      },
    })

    return { applicationId: updated.id, stepCompleted: 5, status: 'SUBMITTED', message: 'Application submitted! You will be notified once reviewed.' }
  }

  // ── Organisation Flow ───────────────────────────────────────────────────────

  async startOrgOnboarding(dto: StartOrgOnboardingDto, institutionId: string) {
    const existing = await this.prisma.onboardingApplication.findFirst({
      where: { phone: dto.phone, institutionId, type: 'ORGANISATION' },
    })
    if (existing) {
      return { applicationId: existing.id, status: existing.status, stepCompleted: existing.stepCompleted }
    }

    const app = await this.prisma.onboardingApplication.create({
      data: {
        institutionId,
        type: 'ORGANISATION',
        status: 'DRAFT',
        phone: dto.phone,
        firstName: dto.contactName,
        organisationName: dto.organisationName,
        email: dto.email,
        stepCompleted: 1,
        formData: {
          step1: {
            contactName: dto.contactName,
            phone: dto.phone,
            email: dto.email,
            organisationName: dto.organisationName,
            organisationType: dto.organisationType,
            rcNumber: dto.rcNumber,
          },
        },
      },
    })

    return { applicationId: app.id, stepCompleted: 1, message: 'Step 1 complete. Tell us about your services.' }
  }

  async saveOrgServices(dto: OrgServicesStepDto, institutionId: string) {
    const app = await this.getApplication(dto.applicationId, institutionId)
    const existing = app.formData as Record<string, unknown>

    const updated = await this.prisma.onboardingApplication.update({
      where: { id: dto.applicationId },
      data: {
        stepCompleted: Math.max(app.stepCompleted, 2),
        formData: { ...existing, step2: { serviceCategories: dto.serviceCategories, serviceZoneIds: dto.serviceZoneIds, description: dto.description } },
      },
    })

    return { applicationId: updated.id, stepCompleted: 2, message: 'Step 2 complete. Upload your company documents.' }
  }

  async saveOrgDocuments(applicationId: string, institutionId: string, documents: Array<{ type: string; name: string }>) {
    const app = await this.getApplication(applicationId, institutionId)
    const existing = app.formData as Record<string, unknown>

    const updated = await this.prisma.onboardingApplication.update({
      where: { id: applicationId },
      data: {
        stepCompleted: Math.max(app.stepCompleted, 3),
        formData: { ...existing, step3: { documents } },
      },
    })

    return { applicationId: updated.id, stepCompleted: 3, message: 'Documents saved. Set up your team.' }
  }

  async saveOrgTeam(dto: OrgTeamStepDto, institutionId: string) {
    const app = await this.getApplication(dto.applicationId, institutionId)
    const existing = app.formData as Record<string, unknown>

    const updated = await this.prisma.onboardingApplication.update({
      where: { id: dto.applicationId },
      data: {
        stepCompleted: 4,
        status: 'SUBMITTED',
        formData: { ...existing, step4: { branches: dto.branches ?? [] } },
      },
    })

    return { applicationId: updated.id, stepCompleted: 4, status: 'SUBMITTED', message: 'Organisation application submitted for review!' }
  }

  // ── Review (Institution Admin / Super Admin) ────────────────────────────────

  async listApplications(institutionId: string, type?: string, status?: string, page = 1, limit = 20) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20
    const where: any = { institutionId }
    if (type) where.type = type
    if (status) where.status = status

    const [apps, total] = await Promise.all([
      this.prisma.onboardingApplication.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.onboardingApplication.count({ where }),
    ])

    return { data: apps, pagination: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) } }
  }

  async getApplication(applicationId: string, institutionId: string) {
    const app = await this.prisma.onboardingApplication.findFirst({
      where: { id: applicationId, institutionId },
    })
    if (!app) throw new NotFoundException('Application not found')
    return app
  }

  async reviewApplication(applicationId: string, institutionId: string, dto: ReviewApplicationDto, reviewedById: string) {
    const app = await this.getApplication(applicationId, institutionId)

    if (app.status === 'ACTIVE') throw new BadRequestException('Application already activated')

    const newStatus = dto.decision === 'APPROVE' ? 'APPROVED' : dto.decision === 'REJECT' ? 'REJECTED' : 'NEEDS_MORE_INFO'

    await this.prisma.onboardingApplication.update({
      where: { id: applicationId },
      data: { status: newStatus as any, reviewedById, reviewedAt: new Date(), reviewNotes: dto.notes, rejectionReason: dto.rejectionReason },
    })

    if (dto.decision === 'APPROVE') {
      if (app.type === 'INDIVIDUAL_WORKER') {
        return this.activateWorker(app, institutionId, reviewedById)
      }
      if (app.type === 'ORGANISATION') {
        return this.activateOrganisation(app, institutionId, reviewedById)
      }
    }

    return { status: newStatus, message: dto.decision === 'NEEDS_MORE_INFO' ? 'Applicant notified to provide more information.' : `Application ${newStatus.toLowerCase()}.` }
  }

  // ── Activation ──────────────────────────────────────────────────────────────

  private async activateWorker(app: any, institutionId: string, activatedBy: string) {
    const formData = app.formData as Record<string, any>
    const step2 = formData.step2 ?? {}
    const step5 = formData.step5 ?? {}

    const user = await this.prisma.userAccount.create({
      data: {
        institutionId,
        firstName: app.firstName ?? '',
        lastName: app.lastName ?? '',
        phone: app.phone,
        email: app.email,
        role: 'WORKER',
      },
    })

    const worker = await this.prisma.workerProfile.create({
      data: {
        institutionId,
        userId: user.id,
        primarySkill: app.primarySkill ?? step2.primarySkill ?? 'General',
        skills: step2.skills ?? [app.primarySkill ?? 'General'],
        categoryIds: step2.categoryIds ?? [],
        yearsExperience: step2.yearsExperience,
        hourlyRate: step2.hourlyRate,
        dailyRate: step2.dailyRate,
        bio: step2.bio,
        serviceZoneIds: step5.serviceZoneIds ?? [],
        availabilityNotes: step5.availabilityNotes,
        verificationStatus: 'UNVERIFIED',
      },
    })

    await this.prisma.onboardingApplication.update({
      where: { id: app.id },
      data: { status: 'ACTIVE', workerId: worker.id },
    })

    await this.trustScoreService.emitEvent({
      type: 'ACCOUNT_CREATED',
      workerId: worker.id,
      institutionId,
      createdBy: activatedBy,
    })

    // Send welcome email
    if (app.email) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { name: true },
      })
      this.email.sendWelcome({
        to: app.email,
        firstName: app.firstName,
        communityName: institution?.name ?? 'TrustGrid',
      }).catch(err => this.logger.warn({ err }, 'welcome_email_failed'))
    }

    return { status: 'ACTIVE', workerId: worker.id, message: `${app.firstName} ${app.lastName} is now active in your workforce registry.` }
  }

  private async activateOrganisation(app: any, institutionId: string, activatedBy: string) {
    const formData = app.formData as Record<string, any>
    const step1 = formData.step1 ?? {}
    const step2 = formData.step2 ?? {}
    const step4 = formData.step4 ?? {}

    const slug = (app.organisationName ?? 'org')
      .toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

    const org = await this.prisma.organisation.create({
      data: {
        institutionId,
        name: app.organisationName ?? '',
        slug: `${slug}-${Date.now()}`,
        type: step1.organisationType ?? 'OTHER',
        rcNumber: step1.rcNumber,
        phone: app.phone,
        email: app.email,
        serviceCategories: step2.serviceCategories ?? [],
        serviceZoneIds: step2.serviceZoneIds ?? [],
        description: step2.description,
        onboardingStatus: 'ACTIVE',
        verificationStatus: 'PARTIALLY_VERIFIED',
        adminUserId: activatedBy,
      },
    })

    // Create branches from the team step
    const branches = step4.branches ?? []
    for (const branch of branches) {
      await this.prisma.organisationBranch.create({
        data: {
          organisationId: org.id,
          institutionId,
          name: branch.name,
          address: branch.address,
          city: branch.city,
          managerName: branch.managerName,
          managerPhone: branch.managerPhone,
        },
      })
    }

    await this.prisma.onboardingApplication.update({
      where: { id: app.id },
      data: { status: 'ACTIVE', organisationId: org.id },
    })

    return { status: 'ACTIVE', organisationId: org.id, message: `${app.organisationName} is now active in your vendor registry.` }
  }

  // ── Application Status (for applicant polling) ──────────────────────────────

  async getApplicationStatus(applicationId: string) {
    const app = await this.prisma.onboardingApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        type: true,
        status: true,
        stepCompleted: true,
        firstName: true,
        lastName: true,
        organisationName: true,
        reviewNotes: true,
        rejectionReason: true,
        updatedAt: true,
      },
    })
    if (!app) throw new NotFoundException('Application not found')
    return app
  }

  private assertStep(app: any, minStep: number) {
    if (app.status === 'ACTIVE') throw new BadRequestException('Application is already active')
    if (app.status === 'REJECTED') throw new BadRequestException('Application was rejected')
  }

  // ── Bulk Import ─────────────────────────────────────────────────────────────

  async bulkImport(
    members: Array<{ firstName: string; lastName: string; phone?: string; email?: string }>,
    institutionId: string,
    importedById: string,
  ) {
    let imported = 0
    let skipped = 0

    for (const m of members) {
      if (!m.firstName || (!m.phone && !m.email)) { skipped++; continue }

      // Check if already exists
      const existing = await this.prisma.userAccount.findFirst({
        where: {
          institutionId,
          OR: [
            ...(m.phone ? [{ phone: m.phone }] : []),
            ...(m.email ? [{ email: m.email.toLowerCase() }] : []),
          ],
        },
      })

      if (existing) { skipped++; continue }

      await this.prisma.userAccount.create({
        data: {
          institutionId,
          firstName: m.firstName,
          lastName: m.lastName ?? '',
          phone: m.phone ?? `IMPORT-${Date.now()}-${Math.random()}`,
          email: m.email?.toLowerCase(),
          role: 'RESIDENT',
        },
      })
      imported++
    }

    return { imported, skipped, total: members.length }
  }
}
