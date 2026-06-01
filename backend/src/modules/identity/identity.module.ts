import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { IdentityController }         from './identity.controller'
import { IdentityService }            from './identity.service'
import { IdentityAdapterRegistry }    from '../../common/adapters/identity-adapter.registry'
import { NigeriaIdentityAdapter }     from '../../common/adapters/nigeria-identity.adapter'
import { ManualVerificationAdapter }  from '../../common/adapters/manual-verification.adapter'
import { MockIdentityAdapter }        from '../../common/adapters/mock-identity.adapter'
import { AmazonRekognitionAdapter }   from '../../common/adapters/amazon-rekognition.adapter'
import { PremblyCACAdapter }          from '../../common/adapters/prembly-cac.adapter'
import { TrustScoreModule }           from '../trust-score/trust-score.module'

@Module({
  imports: [
    HttpModule.register({ timeout: 30_000 }),
    TrustScoreModule,
  ],
  controllers: [IdentityController],
  providers: [
    IdentityService,
    IdentityAdapterRegistry,
    NigeriaIdentityAdapter,
    ManualVerificationAdapter,
    MockIdentityAdapter,
    AmazonRekognitionAdapter,
    PremblyCACAdapter,
  ],
  exports: [IdentityService],
})
export class IdentityModule {}
