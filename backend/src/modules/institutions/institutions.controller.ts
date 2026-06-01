import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { InstitutionsService } from './institutions.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'

@ApiTags('Institution')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('institution')

export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'INSTITUTION_VIEWER', 'ORGANISATION_ADMIN')
  @ApiOperation({ summary: 'Get current institution details' })
  async getMyInstitution(@CurrentUser() user: CurrentUserPayload) {
    return this.institutionsService.getMyInstitution(user.institutionId)
  }

  @Patch()
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Update institution details' })
  async updateInstitution(
    @Body() body: { name?: string; phone?: string; address?: string; city?: string; state?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.institutionsService.updateInstitution(user.institutionId, body)
  }

  @Get('config')
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'INSTITUTION_VIEWER')
  @ApiOperation({ summary: 'Get institution configuration' })
  async getConfig(@CurrentUser() user: CurrentUserPayload) {
    return this.institutionsService.getConfig(user.institutionId)
  }

  @Patch('config')
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Update institution configuration' })
  async updateConfig(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.institutionsService.updateConfig(user.institutionId, body)
  }

  @Get('operators')
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'List institution operators and admins' })
  async listOperators(@CurrentUser() user: CurrentUserPayload) {
    return this.institutionsService.listOperators(user.institutionId)
  }

  @Post('operators')
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Create an operator account' })
  async createOperator(
    @Body() body: { firstName: string; lastName: string; phone: string; email?: string; role: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.institutionsService.createOperator(user.institutionId, body)
  }
}
