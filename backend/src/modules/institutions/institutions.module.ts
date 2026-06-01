import { Module } from '@nestjs/common'
import { InstitutionsController } from './institutions.controller'
import { InstitutionsService } from './institutions.service'
import { CacheService } from '../../common/redis/cache.service'

@Module({
  controllers: [InstitutionsController],
  providers: [InstitutionsService, CacheService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
