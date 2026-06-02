import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { VendorsService, CreateVendorDto } from './vendors.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'

@ApiTags('Vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors')

export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @ApiOperation({ summary: 'Register a vendor' })
  async create(@Body() dto: CreateVendorDto, @CurrentUser() user: CurrentUserPayload) {
    return this.vendorsService.create(dto, user.institutionId)
  }

  @Get()
  @ApiOperation({ summary: 'List vendors' })
  async list(
    @Query('search') search: string,
    @Query('categoryId') categoryId: string,
    @Query('isPreferred') isPreferred: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.vendorsService.list(user.institutionId, {
      search, categoryId,
      isPreferred: isPreferred === 'true',
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor detail' })
  async getById(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.vendorsService.getById(id, user.institutionId)
  }

  @Patch(':id/preferred')
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Mark/unmark vendor as preferred' })
  async setPreferred(
    @Param('id') id: string,
    @Body() body: { isPreferred: boolean },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.vendorsService.setPreferred(id, user.institutionId, body.isPreferred)
  }

  @Post(':id/blacklist')
  @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Blacklist a vendor' })
  async blacklist(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.vendorsService.blacklist(id, user.institutionId, body.reason)
  }

  @Post(':id/recompute-trust-score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recompute and save vendor trust score based on verification, ratings, and contracts' })
  async recomputeTrustScore(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.vendorsService.recomputeAndSaveVendorTrustScore(id, user.institutionId)
  }
}
