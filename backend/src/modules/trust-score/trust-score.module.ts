import { Module } from '@nestjs/common'
import { TrustScoreService } from './trust-score.service'
import { TrustScoreController } from './trust-score.controller'
import { CacheService } from '../../common/redis/cache.service'

@Module({
  controllers: [TrustScoreController],
  providers: [TrustScoreService, CacheService],
  exports: [TrustScoreService],
})
export class TrustScoreModule {}
