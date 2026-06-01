import { Module } from '@nestjs/common'
import { BlacklistController } from './blacklist.controller'
import { BlacklistService } from './blacklist.service'
import { TrustScoreModule } from '../trust-score/trust-score.module'
import { TermiiService } from '../../common/notifications/termii.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [TrustScoreModule, HttpModule.register({ timeout: 10_000 })],
  controllers: [BlacklistController],
  providers: [BlacklistService, TermiiService],
  exports: [BlacklistService],
})
export class BlacklistModule {}
