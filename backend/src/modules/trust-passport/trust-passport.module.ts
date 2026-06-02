import { Module } from '@nestjs/common'
import { TrustPassportController } from './trust-passport.controller'
import { TrustPassportService } from './trust-passport.service'
import { CredentialExpiryService } from './credential-expiry.service'
import { TrustScoreModule } from '../trust-score/trust-score.module'

@Module({
  imports: [TrustScoreModule],
  controllers: [TrustPassportController],
  providers: [TrustPassportService, CredentialExpiryService],
  exports: [TrustPassportService, CredentialExpiryService],
})
export class TrustPassportModule {}
