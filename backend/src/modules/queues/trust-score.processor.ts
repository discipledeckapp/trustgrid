import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { QUEUES, TRUST_SCORE_JOBS } from './queue.constants'
import { TrustScoreService } from '../trust-score/trust-score.service'
import { PrismaService } from '../../prisma/prisma.service'
import { CacheService } from '../../common/redis/cache.service'

@Processor(QUEUES.TRUST_SCORE)
export class TrustScoreProcessor extends WorkerHost {
  private readonly logger = new Logger(TrustScoreProcessor.name)

  constructor(
    private readonly trustScoreService: TrustScoreService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {
    super()
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case TRUST_SCORE_JOBS.RECOMPUTE:
        await this.handleRecompute(job.data)
        break
      case TRUST_SCORE_JOBS.EMIT_EVENT:
        await this.handleEmitEvent(job.data)
        break
      default:
        this.logger.warn({ jobName: job.name }, 'unknown_trust_score_job')
    }
  }

  private async handleRecompute(data: { workerId: string; institutionId: string }) {
    const { workerId, institutionId } = data
    try {
      const score = await this.trustScoreService.recomputeAndPersist(workerId, institutionId)
      // Invalidate cached score — fresh one will be written on next read
      await this.cache.del(this.cache.trustScoreKey(workerId, institutionId))
      await this.cache.del(this.cache.dashboardKey(institutionId))
      this.logger.log({ workerId, institutionId, score }, 'trust_score_recomputed')
    } catch (err) {
      this.logger.error({ workerId, institutionId, err }, 'trust_score_recompute_failed')
      throw err // BullMQ will retry
    }
  }

  private async handleEmitEvent(data: Parameters<TrustScoreService['emitEvent']>[0]) {
    await this.trustScoreService.emitEvent(data)
  }
}
