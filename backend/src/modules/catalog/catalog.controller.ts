import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CatalogService, CreateDomainDto, CreateCategoryDto, UpdateCategoryDto } from './catalog.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Service Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── Public — read catalog (no auth needed) ────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get full service catalog (domains + categories)' })
  getFullCatalog(@Query('includeInactive') includeInactive: string) {
    return this.catalogService.getFullCatalog(includeInactive === 'true')
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories with optional domain and professional filter' })
  getCategories(
    @Query('domainId') domainId: string,
    @Query('isProfessional') isProfessional: string,
  ) {
    return this.catalogService.getCategories(
      domainId || undefined,
      isProfessional !== undefined ? isProfessional === 'true' : undefined,
    )
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category detail' })
  getCategoryById(@Param('id') id: string) {
    return this.catalogService.getCategoryById(id)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Catalog statistics' })
  getStats() {
    return this.catalogService.getCatalogStats()
  }

  // ── Protected — institution manages its own catalog subset ─────────────────

  @Get('institution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get catalog for this institution with overrides applied' })
  getInstitutionCatalog(@CurrentUser() user: CurrentUserPayload) {
    return this.catalogService.getInstitutionCatalog(user.institutionId)
  }

  @Patch('institution/:categoryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable/disable a category or set institution-specific min trust score' })
  setInstitutionOverride(
    @Param('categoryId') categoryId: string,
    @Body() body: { isEnabled?: boolean; minTrustScore?: number; customLabel?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.catalogService.setInstitutionCategoryOverride(
      user.institutionId, categoryId, body,
    )
  }

  // ── Platform Admin only ────────────────────────────────────────────────────

  @Post('domains')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[PLATFORM_ADMIN] Create a new service domain' })
  createDomain(@Body() dto: CreateDomainDto, @CurrentUser() user: CurrentUserPayload) {
    return this.catalogService.createDomain(dto, user.sub)
  }

  @Patch('domains/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[PLATFORM_ADMIN] Update a domain' })
  updateDomain(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDomainDto> & { isActive?: boolean },
  ) {
    return this.catalogService.updateDomain(id, dto)
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[PLATFORM_ADMIN] Add a new category to the platform catalog' })
  createCategory(@Body() dto: CreateCategoryDto, @CurrentUser() user: CurrentUserPayload) {
    return this.catalogService.createCategory(dto, user.sub)
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[PLATFORM_ADMIN] Update a catalog category' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto)
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[PLATFORM_ADMIN] Deactivate (soft delete) a category' })
  deactivateCategory(@Param('id') id: string) {
    return this.catalogService.deactivateCategory(id)
  }
}
