import { Module, Global } from '@nestjs/common'
import { ZeptomailService } from './zeptomail.service'

@Global()
@Module({
  providers: [ZeptomailService],
  exports: [ZeptomailService],
})
export class EmailModule {}
