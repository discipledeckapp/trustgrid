import { Module } from '@nestjs/common';
import { EndorsementsController } from './endorsements.controller';
import { EndorsementsService } from './endorsements.service';
import { TrustScoreModule } from '../trust-score/trust-score.module';

@Module({
  imports: [TrustScoreModule],
  controllers: [EndorsementsController],
  providers: [EndorsementsService],
  exports: [EndorsementsService],
})
export class EndorsementsModule {}
