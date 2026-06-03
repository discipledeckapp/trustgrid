import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { TrustScoreService } from '../trust-score/trust-score.service'
import { TermiiService } from '../../common/notifications/termii.service'
import { ZeptomailService } from '../../common/email/zeptomail.service'

export interface BlacklistWorkerDto {
  workerId?: string
  identifier?: string   // phone or email — alternative to workerId
  reason: string
  category: 'MISCONDUCT' | 'THEFT' | 'VIOLENCE' | 'FRAUD' | 'ABANDONMENT' | 'POLICY_VIOLATION' | 'OTHER'
  evidence?: string
  notifyWorker?: boolean
}

export interface UnblacklistDto {
  workerId: string
  reason: string
  notifyWorker?: boolean
}

export interface BlacklistOrgDto {
  organisationId: string
  reason: string
  category: 'MISCONDUCT' | 'FRAUD' | 'POLICY_VIOLATION' | 'SAFETY_VIOLATION' | 'OTHER'
  evidence?: string
}

@Injectable()
export class BlacklistService {
  private readonly logger = new Logger(BlacklistService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScore: TrustScoreService,
    private readonly termii: TermiiService,
    private readonly email: ZeptomailService,
  ) {}

  /** Look up a worker by phone, email, or workerId within an institution */
  async lookupWorker(identifier: string, institutionId: string) {
    const isPhone = /^\+?[\d\s\-()]{7,}$/.test(identifier)
    const isEmail = identifier.includes('@')

    let user: any = null
    if (isPhone) {
      const phone = identifier.replace(/\D/g, '')
      user = await this.prisma.userAccount.findFirst({
        where: {
          institutionId,
          OR: [
            { phone: identifier },
            { phone: phone },
            { phone: `0${phone.slice(-10)}` },
            { phone: `+234${phone.slice(-10)}` },
          ],
        },
        include: { workerProfiles: true },
      })
    } else if (isEmail) {
      user = await this.prisma.userAccount.findFirst({
        where: { institutionId, email: identifier.toLowerCase().trim() },
        include: { workerProfiles: true },
      })
    } else {
      // Treat as workerId
      const worker = await this.prisma.workerProfile.findFirst({
        where: { id: identifier, institutionId },
        include: { user: true },
      })
      if (worker) return {
        workerId: worker.id,
        name: `${worker.user.firstName} ${worker.user.lastName}`,
        phone: worker.user.phone,
        email: worker.user.email,
        primarySkill: worker.primarySkill,
        trustScore: worker.trustScore,
        verificationStatus: worker.verificationStatus,
        isBlacklisted: worker.verificationStatus === 'SUSPENDED',
      }
    }

    if (!user?.workerProfiles?.[0]) return null
    const w = user.workerProfiles[0]
    return {
      workerId: w.id,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
      primarySkill: w.primarySkill,
      trustScore: w.trustScore,
      verificationStatus: w.verificationStatus,
      isBlacklisted: w.verificationStatus === 'SUSPENDED',
    }
  }

  async blacklistWorker(dto: BlacklistWorkerDto, institutionId: string, blacklistedById: string) {
    // Resolve workerId from identifier if needed
    let workerId = dto.workerId
    if (!workerId && dto.identifier) {
      const found = await this.lookupWorker(dto.identifier, institutionId)
      if (!found) throw new NotFoundException('Worker not found. Check the phone number, email, or ID.')
      workerId = found.workerId
    }
    if (!workerId) throw new BadRequestException('Provide workerId or identifier (phone/email)')

    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
      include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } },
    })
    if (!worker) throw new NotFoundException('Worker not found in this institution')
    if (worker.verificationStatus === 'SUSPENDED') {
      throw new BadRequestException('Worker is already blacklisted')
    }

    await this.prisma.workerProfile.update({
      where: { id: workerId },
      data: { isAvailable: false, verificationStatus: 'SUSPENDED' },
    })

    // Audit record
    await this.prisma.incidentReport.create({
      data: {
        institutionId,
        workerId,
        reportedById: blacklistedById,
        title: `Blacklisted: ${dto.category.replace(/_/g, ' ')}`,
        description: dto.reason + (dto.evidence ? `\n\nEvidence: ${dto.evidence}` : ''),
        severity: 'HIGH',
        status: 'RESOLVED',
        incidentDate: new Date(),
      },
    })

    await this.trustScore.emitEvent({
      type: 'SUSPENSION',
      workerId,
      institutionId,
      referenceType: 'blacklist',
      createdBy: blacklistedById,
      metadata: { category: dto.category, reason: dto.reason },
    })

    const shouldNotify = dto.notifyWorker !== false
    let smsSent = false
    let emailSent = false
    const firstName = worker.user.firstName
    const fullName = `${firstName} ${worker.user.lastName}`
    const appealRef = `BLACKLIST-${workerId.slice(-8).toUpperCase()}`

    if (shouldNotify) {
      const smsMsg = [
        `Hello ${firstName},`,
        `Your TrustGrid profile has been suspended.`,
        `Reason: ${dto.reason}`,
        `Category: ${dto.category.replace(/_/g, ' ')}`,
        `To appeal, email hello@trustgrid.ng quoting ref: ${appealRef}`,
        `TrustGrid`,
      ].join('\n')

      if (worker.user.phone) {
        const r = await this.termii.sendMultiChannel(worker.user.phone, smsMsg)
        smsSent = r.sms.sent || r.whatsapp.sent
      }

      if (worker.user.email) {
        emailSent = await this.email.sendEmail({
          to: worker.user.email,
          toName: fullName,
          subject: `Important: Your TrustGrid profile has been suspended — ${appealRef}`,
          htmlBody: `
            <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto">
              <div style="background:linear-gradient(135deg,#DC2626,#991B1B);padding:24px 28px;border-radius:12px 12px 0 0">
                <h2 style="color:white;margin:0;font-size:18px">Profile Suspended — TrustGrid</h2>
              </div>
              <div style="padding:28px;background:#fff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px">
                <p style="color:#111;font-size:15px;margin:0 0 16px">Dear ${firstName},</p>
                <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px">
                  We are writing to inform you that your TrustGrid profile has been <strong>suspended</strong> by the institution administrator.
                </p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
                  <tr style="background:#fef2f2"><td style="padding:10px 16px;font-weight:600;color:#991B1B">Category</td><td style="padding:10px 16px;color:#111">${dto.category.replace(/_/g, ' ')}</td></tr>
                  <tr><td style="padding:10px 16px;font-weight:600;color:#374151">Reason</td><td style="padding:10px 16px;color:#111">${dto.reason}</td></tr>
                  <tr style="background:#f9fafb"><td style="padding:10px 16px;font-weight:600;color:#374151">Reference</td><td style="padding:10px 16px;color:#111;font-family:monospace">${appealRef}</td></tr>
                </table>
                <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">
                  If you believe this decision is incorrect, you have the right to appeal. Email <a href="mailto:hello@trustgrid.ng" style="color:#4F46E5">hello@trustgrid.ng</a> quoting your reference number.
                </p>
                <p style="color:#6B7280;font-size:12px;margin:0">TrustGrid · Trusted People. Accountable Service.</p>
              </div>
            </div>
          `,
        })
      }
    }

    this.logger.log({ workerId, fullName, smsSent, emailSent }, 'worker_blacklisted')

    return {
      status: 'BLACKLISTED',
      workerId,
      workerName: fullName,
      reason: dto.reason,
      category: dto.category,
      smsSent,
      emailSent,
      appealReference: appealRef,
      message: `${fullName} has been blacklisted. ${smsSent || emailSent ? 'Notified via ' + [smsSent && 'SMS/WhatsApp', emailSent && 'email'].filter(Boolean).join(' + ') + '.' : 'No contact info on file.'}`,
    }
  }

  async unblacklistWorker(dto: UnblacklistDto, institutionId: string, unblockedById: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: dto.workerId, institutionId },
      include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } },
    })
    if (!worker) throw new NotFoundException('Worker not found')

    await this.prisma.workerProfile.update({
      where: { id: dto.workerId },
      data: { verificationStatus: 'PARTIALLY_VERIFIED', isAvailable: true },
    })

    await this.trustScore.emitEvent({
      type: 'REINSTATEMENT',
      workerId: dto.workerId,
      institutionId,
      createdBy: unblockedById,
      metadata: { reason: dto.reason },
    })

    const firstName = worker.user.firstName
    const fullName = `${firstName} ${worker.user.lastName}`

    if (dto.notifyWorker !== false) {
      const msg = `Hello ${firstName}, your TrustGrid profile has been reinstated. Reason: ${dto.reason}. You may accept assignments again. — TrustGrid`
      if (worker.user.phone) await this.termii.sendMultiChannel(worker.user.phone, msg)
      if (worker.user.email) {
        await this.email.sendEmail({
          to: worker.user.email,
          toName: fullName,
          subject: 'Your TrustGrid profile has been reinstated',
          htmlBody: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:28px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:#059669;margin:0 0 16px">Profile Reinstated ✓</h2>
            <p style="color:#111;font-size:14px;line-height:1.6;margin:0 0 12px">Dear ${firstName}, your TrustGrid profile has been reinstated.</p>
            <p style="color:#374151;font-size:14px;margin:0 0 20px"><strong>Reason:</strong> ${dto.reason}</p>
            <p style="color:#374151;font-size:14px;margin:0">You can now accept assignments on TrustGrid again.</p>
            <p style="color:#6B7280;font-size:12px;margin:20px 0 0">TrustGrid · Trusted People. Accountable Service.</p>
          </div>`,
        })
      }
    }

    return { status: 'REINSTATED', workerId: dto.workerId, workerName: fullName }
  }

  async blacklistOrganisation(dto: BlacklistOrgDto, institutionId: string, blacklistedById: string) {
    const org = await this.prisma.organisation.findFirst({
      where: { id: dto.organisationId, institutionId },
    })
    if (!org) throw new NotFoundException('Organisation not found')
    if (org.verificationStatus === 'SUSPENDED') {
      throw new BadRequestException('Organisation is already blacklisted')
    }

    await this.prisma.organisation.update({
      where: { id: dto.organisationId },
      data: { verificationStatus: 'SUSPENDED', isActive: false },
    })

    // Audit via AuditLog
    await this.prisma.auditLog.create({
      data: {
        institutionId,
        userId: blacklistedById,
        action: 'ORGANISATION_BLACKLISTED',
        entityType: 'Organisation',
        entityId: dto.organisationId,
        newState: {
          category: dto.category,
          reason: dto.reason,
          evidence: dto.evidence ?? null,
          orgName: org.name,
        },
      },
    })

    this.logger.log({ orgId: dto.organisationId, orgName: org.name }, 'organisation_blacklisted')

    return {
      status: 'BLACKLISTED',
      organisationId: dto.organisationId,
      organisationName: org.name,
      reason: dto.reason,
      category: dto.category,
      message: `${org.name} has been blacklisted.`,
    }
  }

  async unblacklistOrganisation(organisationId: string, reason: string, institutionId: string, unblockedById: string) {
    const org = await this.prisma.organisation.findFirst({
      where: { id: organisationId, institutionId },
    })
    if (!org) throw new NotFoundException('Organisation not found')

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: { verificationStatus: 'FULLY_VERIFIED', isActive: true },
    })

    await this.prisma.auditLog.create({
      data: {
        institutionId,
        userId: unblockedById,
        action: 'ORGANISATION_REINSTATED',
        entityType: 'Organisation',
        entityId: organisationId,
        newState: { reason, orgName: org.name },
      },
    })

    return { status: 'REINSTATED', organisationId, organisationName: org.name }
  }

  async getBlacklist(institutionId: string, page = 1, limit = 20) {
    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where: { institutionId, verificationStatus: 'SUSPENDED' },
        include: {
          user: { select: { firstName: true, lastName: true, phone: true, email: true } },
          incidents: {
            where: { title: { startsWith: 'Blacklisted:' } },
            orderBy: { incidentDate: 'desc' },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.workerProfile.count({ where: { institutionId, verificationStatus: 'SUSPENDED' } }),
    ])

    return {
      data: workers.map(w => ({
        id: w.id,
        name: `${w.user.firstName} ${w.user.lastName}`,
        phone: w.user.phone,
        email: w.user.email,
        primarySkill: w.primarySkill,
        trustScore: w.trustScore,
        lastIncident: w.incidents[0] ? {
          reason: w.incidents[0].description,
          category: w.incidents[0].title.replace('Blacklisted: ', ''),
          date: w.incidents[0].incidentDate,
        } : null,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getBlacklistedOrganisations(institutionId: string, page = 1, limit = 20) {
    const [orgs, total] = await Promise.all([
      this.prisma.organisation.findMany({
        where: { institutionId, verificationStatus: 'SUSPENDED' },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.organisation.count({ where: { institutionId, verificationStatus: 'SUSPENDED' } }),
    ])
    return {
      data: orgs.map(o => ({
        id: o.id,
        name: o.name,
        type: o.type,
        phone: o.phone,
        email: o.email,
        rcNumber: o.rcNumber,
      })),
      pagination: { total, page, limit },
    }
  }

  async getAuditTrail(institutionId: string, page = 1, limit = 30) {
    const [incidents, orgLogs] = await Promise.all([
      this.prisma.incidentReport.findMany({
        where: {
          institutionId,
          title: { startsWith: 'Blacklisted:' },
        },
        include: {
          worker: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { incidentDate: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.auditLog.findMany({
        where: {
          institutionId,
          action: { in: ['ORGANISATION_BLACKLISTED', 'ORGANISATION_REINSTATED'] },
        },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    const workerEvents = incidents.map(i => ({
      id: i.id,
      type: 'WORKER',
      action: 'BLACKLISTED',
      subjectName: i.worker ? `${i.worker.user.firstName} ${i.worker.user.lastName}` : 'Unknown',
      category: i.title.replace('Blacklisted: ', ''),
      reason: i.description?.split('\n\nEvidence:')[0] ?? '',
      performedBy: 'Admin',
      date: i.incidentDate,
    }))

    const orgEvents = orgLogs.map(l => ({
      id: l.id,
      type: 'ORGANISATION',
      action: l.action === 'ORGANISATION_BLACKLISTED' ? 'BLACKLISTED' : 'REINSTATED',
      subjectName: (l.newState as any)?.orgName ?? 'Unknown',
      category: (l.newState as any)?.category ?? '—',
      reason: (l.newState as any)?.reason ?? '',
      performedBy: l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System',
      date: l.createdAt,
    }))

    const all = [...workerEvents, ...orgEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return { data: all.slice(0, limit), total: all.length }
  }

  async getGlobalBlacklist(page = 1, limit = 50) {
    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where: { verificationStatus: 'SUSPENDED' },
        include: {
          user: { select: { firstName: true, lastName: true, phone: true, email: true } },
          institution: { select: { name: true } },
          incidents: {
            where: { title: { startsWith: 'Blacklisted:' } },
            orderBy: { incidentDate: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workerProfile.count({ where: { verificationStatus: 'SUSPENDED' } }),
    ])

    return {
      data: workers.map(w => ({
        id: w.id,
        name: `${w.user.firstName} ${w.user.lastName}`,
        phone: w.user.phone,
        email: w.user.email,
        institution: w.institution?.name ?? 'Unknown',
        primarySkill: w.primarySkill,
        trustScore: w.trustScore,
        reason: w.incidents[0]?.description?.split('\n\nEvidence:')[0] ?? '—',
        category: w.incidents[0]?.title?.replace('Blacklisted: ', '') ?? '—',
        date: w.incidents[0]?.incidentDate ?? w.updatedAt,
      })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }
  }

  async checkIsBlacklisted(workerId: string, institutionId: string): Promise<boolean> {
    const w = await this.prisma.workerProfile.findFirst({ where: { id: workerId, institutionId }, select: { verificationStatus: true } })
    return w?.verificationStatus === 'SUSPENDED'
  }

  async submitDispute(workerId: string, userId: string, institutionId: string, reason: string, evidenceUrl?: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true } } },
    })
    if (!worker) throw new NotFoundException('Worker not found')

    const incident = await this.prisma.incidentReport.create({
      data: {
        institutionId,
        workerId,
        reportedById: userId,
        title: `Blacklist Dispute — BLACKLIST-${workerId.slice(-8).toUpperCase()}`,
        description: `DISPUTE by ${worker.user.firstName} ${worker.user.lastName}:\n\n${reason}${evidenceUrl ? `\n\nEvidence: ${evidenceUrl}` : ''}`,
        severity: 'MEDIUM',
        status: 'OPEN',
        incidentDate: new Date(),
      },
    })

    return {
      status: 'DISPUTE_SUBMITTED',
      disputeReference: incident.id,
      message: 'Your dispute has been submitted.',
    }
  }

  async resolveDispute(workerId: string, resolution: 'UPHELD' | 'OVERTURNED', resolvedById: string, institutionId: string, notes: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    })
    if (!worker) throw new NotFoundException('Worker not found')

    if (resolution === 'OVERTURNED') {
      await this.unblacklistWorker({ workerId, reason: `Dispute overturned. ${notes}` }, institutionId, resolvedById)
      return { resolution: 'OVERTURNED', message: 'Worker reinstated.' }
    } else {
      if (worker.user.phone) await this.termii.sendSMS(worker.user.phone, `TrustGrid: Your blacklist appeal (BLACKLIST-${workerId.slice(-8).toUpperCase()}) has been reviewed and upheld. ${notes}`).catch(() => {})
      return { resolution: 'UPHELD', message: 'Blacklist upheld.' }
    }
  }
}
