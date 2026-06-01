import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CacheService } from '../../common/redis/cache.service'
import { TrustEventType, Prisma } from '@prisma/client'

export interface EmitTrustEventDto {
  type: TrustEventType
  workerId?: string
  vendorId?: string
  institutionId: string
  referenceType?: string
  referenceId?: string
  metadata?: Record<string, unknown>
  createdBy?: string
}

export interface TrustScoreBreakdown {
  score: number
  grade: string
  gradeLabel: string
  gradeColor: string
  deploymentScore: number
  ratingScore: number
  endorsementScore: number
  verificationScore: number
  incidentPenalty: number
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE'
  lastUpdatedAt: Date | null
  recentEvents: Array<{ eventType: TrustEventType; delta: number; createdAt: Date }>
}

const DEFAULT_WEIGHTS: Record<string, number> = {
  ACCOUNT_CREATED: 5.0,
  IDENTITY_VERIFIED: 10.0,
  CREDENTIAL_VERIFIED: 5.0,
  DEPLOYMENT_COMPLETED: 2.0,
  DEPLOYMENT_ABANDONED: -3.0,
  RATING_SUBMITTED_5: 3.0,
  RATING_SUBMITTED_4: 1.5,
  RATING_SUBMITTED_3: 0.5,
  RATING_SUBMITTED_2: -1.0,
  RATING_SUBMITTED_1: -2.5,
  ENDORSEMENT_ADDED: 1.5,
  ENDORSEMENT_REMOVED: -1.5,
  INCIDENT_RAISED: -5.0,
  INCIDENT_RESOLVED: 3.0,
  INCIDENT_DISMISSED: 1.0,
  INACTIVITY_PENALTY: -0.5,
  MANUAL_ADJUSTMENT: 1.0,
  SUSPENSION: -20.0,
  REINSTATEMENT: 10.0,
}

const GRADES = [
  { min: 90, grade: 'A+', label: 'Exceptional',    color: '#10B981' },
  { min: 80, grade: 'A',  label: 'Excellent',      color: '#34D399' },
  { min: 70, grade: 'B+', label: 'Good',           color: '#6EE7B7' },
  { min: 60, grade: 'B',  label: 'Satisfactory',   color: '#FCD34D' },
  { min: 50, grade: 'C',  label: 'Fair',           color: '#F59E0B' },
  { min: 35, grade: 'D',  label: 'Below Average',  color: '#F97316' },
  { min: 0,  grade: 'F',  label: 'Poor',           color: '#EF4444' },
]

const SCORE_CACHE_TTL = 300 // 5 minutes

@Injectable()
export class TrustScoreService {
  private readonly logger = new Logger(TrustScoreService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async emitEvent(dto: EmitTrustEventDto): Promise<void> {
    const weight = await this.getWeight(dto.institutionId, dto.type, dto.metadata)
    const delta = weight // delta = weight for now; extendable per event type

    await this.prisma.trustEvent.create({
      data: {
        institutionId: dto.institutionId,
        workerId: dto.workerId,
        vendorId: dto.vendorId,
        eventType: dto.type,
        delta,
        weightApplied: weight,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
        createdBy: dto.createdBy,
      },
    })

    if (dto.workerId) {
      // Invalidate cached score — recomputed asynchronously via queue
      await this.cache.del(this.cache.trustScoreKey(dto.workerId, dto.institutionId))
      await this.recomputeAndPersist(dto.workerId, dto.institutionId)
    }
  }

  async recomputeAndPersist(workerId: string, institutionId: string): Promise<number> {
    const score = await this.computeScore(workerId, institutionId)
    const clamped = Math.max(0, Math.min(100, score))

    await this.prisma.workerProfile.updateMany({
      where: { id: workerId, institutionId },
      data: { trustScore: clamped, trustScoreUpdatedAt: new Date() },
    })

    // Cache the fresh score
    await this.cache.set(
      this.cache.trustScoreKey(workerId, institutionId),
      clamped,
      SCORE_CACHE_TTL,
    )

    this.logger.log({ workerId, institutionId, score: clamped }, 'trust_score_updated')
    return clamped
  }

  async getCachedScore(workerId: string, institutionId: string): Promise<number | null> {
    return this.cache.get<number>(this.cache.trustScoreKey(workerId, institutionId))
  }

  async getScoreBreakdown(workerId: string, institutionId: string): Promise<TrustScoreBreakdown> {
    const events = await this.prisma.trustEvent.findMany({
      where: { workerId, institutionId },
      orderBy: { createdAt: 'desc' },
    })

    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
      select: { trustScore: true, trustScoreUpdatedAt: true },
    })

    const score = worker?.trustScore ?? 0
    const gradeInfo = this.getGrade(score)

    const sum = (types: string[]) =>
      events.filter((e) => types.includes(e.eventType)).reduce((s, e) => s + e.delta, 0)

    const now = Date.now()
    const ms30 = 30 * 24 * 60 * 60 * 1000
    const recent30 = events
      .filter((e) => now - e.createdAt.getTime() < ms30)
      .reduce((s, e) => s + e.delta, 0)
    const prior30 = events
      .filter((e) => {
        const age = now - e.createdAt.getTime()
        return age >= ms30 && age < ms30 * 2
      })
      .reduce((s, e) => s + e.delta, 0)

    const trend: TrustScoreBreakdown['trend'] =
      recent30 > prior30 + 2 ? 'IMPROVING' : recent30 < prior30 - 2 ? 'DECLINING' : 'STABLE'

    return {
      score,
      grade: gradeInfo.grade,
      gradeLabel: gradeInfo.label,
      gradeColor: gradeInfo.color,
      deploymentScore: sum(['DEPLOYMENT_COMPLETED', 'DEPLOYMENT_ABANDONED']),
      ratingScore: sum(['RATING_SUBMITTED']),
      endorsementScore: sum(['ENDORSEMENT_ADDED', 'ENDORSEMENT_REMOVED']),
      verificationScore: sum(['IDENTITY_VERIFIED', 'CREDENTIAL_VERIFIED', 'ACCOUNT_CREATED']),
      incidentPenalty: sum(['INCIDENT_RAISED', 'INCIDENT_RESOLVED', 'INCIDENT_DISMISSED']),
      trend,
      lastUpdatedAt: worker?.trustScoreUpdatedAt ?? null,
      recentEvents: events.slice(0, 10).map((e) => ({
        eventType: e.eventType,
        delta: e.delta,
        createdAt: e.createdAt,
      })),
    }
  }

  private async computeScore(workerId: string, institutionId: string): Promise<number> {
    const [events, config] = await Promise.all([
      this.prisma.trustEvent.findMany({ where: { workerId, institutionId } }),
      this.prisma.institutionConfig.findUnique({
        where: { institutionId },
        select: { trustScoreTimeDecayDays: true },
      }),
    ])

    const halfLifeDays = config?.trustScoreTimeDecayDays ?? 365

    return events.reduce((total, event) => {
      const daysSince = (Date.now() - event.createdAt.getTime()) / 86_400_000
      const decayFactor = Math.pow(0.5, daysSince / halfLifeDays)
      return total + event.delta * decayFactor
    }, 0)
  }

  private async getWeight(
    institutionId: string,
    eventType: TrustEventType,
    metadata?: Record<string, unknown>,
  ): Promise<number> {
    const config = await this.prisma.institutionConfig.findUnique({
      where: { institutionId },
      select: { trustScoreWeights: true },
    })

    const weights = (config?.trustScoreWeights as Record<string, number>) ?? {}

    if (eventType === 'RATING_SUBMITTED' && metadata?.rating) {
      const key = `rating_${metadata.rating}_star`
      return weights[key] ?? DEFAULT_WEIGHTS[`RATING_SUBMITTED_${metadata.rating}`] ?? 0
    }

    const key = eventType.toLowerCase().replace(/_/g, '_')
    return weights[key] ?? DEFAULT_WEIGHTS[eventType] ?? 0
  }

  getGrade(score: number): { grade: string; label: string; color: string } {
    return GRADES.find((g) => score >= g.min) ?? GRADES[GRADES.length - 1]
  }
}
