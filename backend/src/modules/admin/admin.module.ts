import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { BlacklistModule } from '../blacklist/blacklist.module'

@Module({
  imports: [BlacklistModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
