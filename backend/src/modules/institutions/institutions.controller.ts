import { Controller, Get, Patch, Post, Body, UseGuards, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { InstitutionsService } from './institutions.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'
import { UpdateBrandDto } from './dto/update-brand.dto'

@ApiTags('Institution')
@Controller('institution')

export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  // Public — called by Next.js middleware and Flutter app to resolve brand config
  @Get('brand')
  @ApiOperation({ summary: 'Resolve institution brand config by subdomain or custom domain. Public endpoint.' })
  getBrandByDomain(@Query('host') host: string) {
    return this.institutionsService.getBrandByDomain(host)
  }

  @Patch('brand')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update institution brand config (subdomain, colors, logo, custom domain)' })
  updateBrand(@Body() body: UpdateBrandDto, @CurrentUser() user: CurrentUserPayload) {
    return this.institutionsService.updateBrand(user.institutionId, body)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'INSTITUTION_VIEWER', 'ORGANISATION_ADMIN')
  @ApiOperation({ summary: 'Get current institution details' })
  async getMyInstitution(@CurrentUser() user: CurrentUserPayload) {
    return this.institutionsService.getMyInstitution(user.institutionId)
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Update institution details' })
  async updateInstitution(
    @Body() body: { name?: string; phone?: string; address?: string; city?: string; state?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.institutionsService.updateInstitution(user.institutionId, body)
  }

  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'INSTITUTION_VIEWER')
  @ApiOperation({ summary: 'Get institution configuration' })
  async getConfig(@CurrentUser() user: CurrentUserPayload) {
    return this.institutionsService.getConfig(user.institutionId)
  }

  @Patch('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Update institution configuration' })
  async updateConfig(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.institutionsService.updateConfig(user.institutionId, body)
  }

  @Get('operators')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'List institution operators and admins' })
  async listOperators(@CurrentUser() user: CurrentUserPayload) {
    return this.institutionsService.listOperators(user.institutionId)
  }

  @Post('operators')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Create an operator account' })
  async createOperator(
    @Body() body: { firstName: string; lastName: string; phone: string; email?: string; role: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.institutionsService.createOperator(user.institutionId, body)
  }
}
