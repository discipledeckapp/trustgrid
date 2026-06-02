import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'
import { AdminService } from './admin.service'

@ApiTags('Platform Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PLATFORM_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide admin dashboard statistics' })
  getStats() {
    return this.adminService.getStats()
  }

  @Get('institutions')
  @ApiOperation({ summary: 'List institutions across the platform' })
  listInstitutions(@Query('limit') limit: string) {
    return this.adminService.listInstitutions(Number(limit) || 50)
  }

  @Get('workers')
  @ApiOperation({ summary: 'List workers across the platform' })
  listWorkers(
    @Query('limit') limit: string,
    @Query('minTrustScore') minTrustScore: string,
    @Query('verificationStatus') verificationStatus: string,
  ) {
    return this.adminService.listWorkers({
      limit: Number(limit) || 50,
      minTrustScore: minTrustScore ? Number(minTrustScore) : undefined,
      verificationStatus,
    })
  }

  @Get('organisations')
  @ApiOperation({ summary: 'List service organisations across the platform' })
  listOrganisations(@Query('limit') limit: string) {
    return this.adminService.listOrganisations(Number(limit) || 50)
  }

  @Get('passports')
  @ApiOperation({ summary: 'List Trust Passports across the platform' })
  listPassports(@Query('limit') limit: string) {
    return this.adminService.listPassports(Number(limit) || 50)
  }

  @Patch('passports/:id/revoke')
  @ApiOperation({ summary: 'Revoke a Trust Passport' })
  revokePassport(@Param('id') id: string) {
    return this.adminService.revokePassport(id)
  }
}
