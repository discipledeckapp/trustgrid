import { Global, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { TermiiService } from './termii.service'

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 10_000 })],
  providers: [TermiiService],
  exports: [TermiiService],
})
export class NotificationsModule {}
