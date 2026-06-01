import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { VolunteersService, CreateVolunteerDto } from './volunteers.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'

@ApiTags('Volunteers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @ApiOperation({ summary: 'Register a volunteer' })
  create(@Body() dto: CreateVolunteerDto, @CurrentUser() user: CurrentUserPayload) {
    return this.volunteersService.create(dto, user.institutionId)
  }

  @Get()
  @ApiOperation({ summary: 'List volunteers with optional filters' })
  list(
    @Query('skill') skill: string,
    @Query('isAvailable') isAvailable: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.volunteersService.list(user.institutionId, {
      skill,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
      page, limit,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get volunteer by ID' })
  getById(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.volunteersService.getById(id, user.institutionId)
  }

  @Patch(':id/availability')
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @ApiOperation({ summary: 'Toggle volunteer availability' })
  toggleAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.volunteersService.toggleAvailability(id, user.institutionId, body.isAvailable)
  }

  @Post('mobilise')
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @ApiOperation({ summary: 'Find available volunteers by skill for rapid deployment' })
  mobilise(
    @Body() body: { skills: string[]; limit?: number },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.volunteersService.mobilise(user.institutionId, body.skills, body.limit)
  }
}
