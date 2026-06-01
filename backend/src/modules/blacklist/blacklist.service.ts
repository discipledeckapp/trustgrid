/**
 * BlacklistService
 *
 * Institution admins can blacklist workers or organisations.
 * A blacklisted person:
 *   - Cannot be assigned to any service request in that institution
 *   - Trust score is penalised (SUSPENSION event)
 *   - Is notified via SMS + WhatsApp (Termii) — they have a right to know
 *   - Can see the reason (so they can appeal)
 *   - Can appeal: creates an incident investigation
 *
 * Blacklists are per-institution — a worker blacklisted at Estate A
 * can still work at Estate B unless they are also blacklisted there.
 * Platform-wide blacklist (PLATFORM_ADMIN only) blocks across all institutions.
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { TrustScoreService } from '../trust-score/trust-score.service'
import { TermiiService } from '../../common/notifications/termii.service'

export interface BlacklistWorkerDto {
  workerId: string
  reason: string
  category: 'MISCONDUCT' | 'THEFT' | 'VIOLENCE' | 'FRAUD' | 'ABANDONMENT' | 'POLICY_VIOLATION' | 'OTHER'
  evidence?: string
  notifyWorker?: boolean   // default true — worker has a right to know
}

export interface UnblacklistDto {
  workerId: string
  reason: string
  notifyWorker?: boolean
}

@Injectable()
export class BlacklistService {
  private readonly logger = new Logger(BlacklistService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScore: TrustScoreService,
    private readonly termii: TermiiService,
  ) {}

  async blacklistWorker(
    dto: BlacklistWorkerDto,
    institutionId: string,
    blacklistedById: string,
  ) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: dto.workerId, institutionId },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
      },
    })
    if (!worker) throw new NotFoundException('Worker not found')
    if (worker.verificationStatus === 'SUSPENDED') {
      throw new BadRequestException('Worker is already suspended/blacklisted')
    }

    // 1. Mark worker as suspended
    await this.prisma.workerProfile.update({
      where: { id: dto.workerId },
      data: {
        isAvailable: false,
        verificationStatus: 'SUSPENDED',
      },
    })

    // 2. Record as an incident for audit trail
    await this.prisma.incidentReport.create({
      data: {
        institutionId,
        workerId: dto.workerId,
        reportedById: blacklistedById,
        title: `Blacklisted: ${dto.category.replace(/_/g, ' ')}`,
        description: dto.reason + (dto.evidence ? `\n\nEvidence: ${dto.evidence}` : ''),
        severity: 'HIGH',
        status: 'RESOLVED',
        incidentDate: new Date(),
      },
    })

    // 3. Apply trust score penalty
    await this.trustScore.emitEvent({
      type: 'SUSPENSION',
      workerId: dto.workerId,
      institutionId,
      referenceType: 'blacklist',
      createdBy: blacklistedById,
      metadata: { category: dto.category, reason: dto.reason },
    })

    // 4. Notify the worker (default: always notify)
    const shouldNotify = dto.notifyWorker !== false
    let notificationSent = false
    if (shouldNotify && worker.user.phone) {
      const message = [
        `Hello ${worker.user.firstName},`,
        ``,
        `We are writing to inform you that your profile has been suspended on TrustGrid by ${institutionId.slice(0,8)} institution.`,
        ``,
        `Reason: ${dto.reason}`,
        `Category: ${dto.category.replace(/_/g, ' ')}`,
        ``,
        `If you believe this is incorrect, you have the right to appeal. Contact the institution directly or email hello@trustgrid.ng to raise a dispute.`,
        ``,
        `Reference: BLACKLIST-${dto.workerId.slice(-8).toUpperCase()}`,
        ``,
        `TrustGrid — Trusted People. Accountable Service.`,
      ].join('\n')

      const result = await this.termii.sendMultiChannel(worker.user.phone, message)
      notificationSent = result.sms.sent || result.whatsapp.sent

      this.logger.log({
        workerId: dto.workerId,
        workerName: `${worker.user.firstName} ${worker.user.lastName}`,
        notificationSent,
      }, 'blacklist_notification_sent')
    }

    return {
      status: 'BLACKLISTED',
      workerId: dto.workerId,
      workerName: `${worker.user.firstName} ${worker.user.lastName}`,
      reason: dto.reason,
      category: dto.category,
      notificationSent,
      message: `${worker.user.firstName} ${worker.user.lastName} has been blacklisted. ${notificationSent ? 'They have been notified via SMS/WhatsApp.' : 'Notification not sent (no phone on record).'}`,
      appealReference: `BLACKLIST-${dto.workerId.slice(-8).toUpperCase()}`,
    }
  }

  async unblacklistWorker(dto: UnblacklistDto, institutionId: string, unblockedById: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: dto.workerId, institutionId },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    })
    if (!worker) throw new NotFoundException('Worker not found')

    await this.prisma.workerProfile.update({
      where: { id: dto.workerId },
      data: {
        verificationStatus: 'PARTIALLY_VERIFIED', // restore to previous verified state
        isAvailable: true,
      },
    })

    // Restore trust score partially
    await this.trustScore.emitEvent({
      type: 'REINSTATEMENT',
      workerId: dto.workerId,
      institutionId,
      createdBy: unblockedById,
      metadata: { reason: dto.reason },
    })

    // Notify worker of reinstatement
    if (dto.notifyWorker !== false && worker.user.phone) {
      const message = `Hello ${worker.user.firstName}, your TrustGrid profile has been reinstated. Reason: ${dto.reason}. You may now accept assignments again. — TrustGrid`
      await this.termii.sendMultiChannel(worker.user.phone, message)
    }

    return {
      status: 'REINSTATED',
      workerId: dto.workerId,
      workerName: `${worker.user.firstName} ${worker.user.lastName}`,
    }
  }

  async getBlacklist(institutionId: string, page = 1, limit = 20) {
    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where: { institutionId, verificationStatus: 'SUSPENDED' },
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
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
        primarySkill: w.primarySkill,
        trustScore: w.trustScore,
        lastIncident: w.incidents[0] ? {
          reason: w.incidents[0].description,
          date: w.incidents[0].incidentDate,
        } : null,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async checkIsBlacklisted(workerId: string, institutionId: string): Promise<boolean> {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
      select: { verificationStatus: true },
    })
    return worker?.verificationStatus === 'SUSPENDED'
  }
}
