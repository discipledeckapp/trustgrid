import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { BillingController } from './billing.controller'
import { BillingService } from './billing.service'

@Module({
  imports: [HttpModule.register({ timeout: 15_000 })],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
