import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'
import { QUEUES } from './queue.constants'
import { TrustScoreProcessor } from './trust-score.processor'
import { NotificationProcessor } from './notification.processor'
import { TrustScoreModule } from '../trust-score/trust-score.module'
import { CacheService } from '../../common/redis/cache.service'
import { TermiiService } from '../../common/notifications/termii.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUES.TRUST_SCORE },
      { name: QUEUES.NOTIFICATIONS },
      { name: QUEUES.VERIFICATION },
    ),
    TrustScoreModule,
    HttpModule.register({ timeout: 10_000 }),
  ],
  providers: [TrustScoreProcessor, NotificationProcessor, CacheService, TermiiService],
  exports: [BullModule, CacheService, TermiiService],
})
export class QueuesModule {}
