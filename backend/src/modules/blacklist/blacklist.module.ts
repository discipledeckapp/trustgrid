import { Module } from '@nestjs/common'
import { BlacklistController } from './blacklist.controller'
import { BlacklistService } from './blacklist.service'
import { TrustScoreModule } from '../trust-score/trust-score.module'

// TermiiService and ZeptomailService are @Global() — no need to re-declare here
@Module({
  imports: [TrustScoreModule],
  controllers: [BlacklistController],
  providers: [BlacklistService],
  exports: [BlacklistService],
})
export class BlacklistModule {}
