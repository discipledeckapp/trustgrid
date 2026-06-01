import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { OpportunitiesService } from './opportunities.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Opportunities')
@Controller('opportunities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an opportunity' })
  create(@Body() body: any, @CurrentUser() user: CurrentUserPayload) {
    return this.service.create({
      ...body,
      institutionId: user.institutionId,
      createdById: user.sub,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate:   body.endDate   ? new Date(body.endDate)   : undefined,
    })
  }

  @Get()
  @ApiOperation({ summary: 'List all opportunities for institution' })
  list(
    @Query('status') status: string,
    @Query('type')   type: string,
    @Query('page')   page: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.list({ institutionId: user.institutionId, status, type, page: Number(page) || 1 })
  }

  @Get('for-me')
  @ApiOperation({ summary: 'Opportunities this user qualifies for (trust gate evaluated)' })
  listForMe(@CurrentUser() user: CurrentUserPayload) {
    return this.service.listForUser(user.sub, user.institutionId)
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'My submitted applications' })
  myApplications(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getMyApplications(user.sub, user.institutionId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Opportunity detail + applications list' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.service.findOne(id, user.institutionId)
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a draft opportunity' })
  publish(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.service.publish(id, user.institutionId)
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close an opportunity' })
  close(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.service.close(id, user.institutionId)
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply to an opportunity (trust gate enforced server-side)' })
  apply(
    @Param('id') id: string,
    @Body() body: { message?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.apply(id, user.sub, user.institutionId, body.message)
  }

  @Patch('applications/:applicationId/review')
  @ApiOperation({ summary: 'Accept or decline an application' })
  review(
    @Param('applicationId') applicationId: string,
    @Body() body: { decision: 'ACCEPTED' | 'DECLINED'; notes?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.reviewApplication(applicationId, user.sub, user.institutionId, body.decision, body.notes)
  }
}
