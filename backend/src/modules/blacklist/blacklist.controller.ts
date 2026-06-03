import { Controller, Get, Post, Body, Query, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { BlacklistService, BlacklistWorkerDto, UnblacklistDto, BlacklistOrgDto } from './blacklist.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Blacklist Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blacklist')
export class BlacklistController {
  constructor(private readonly svc: BlacklistService) {}

  /** Look up a worker by phone, email, or worker ID before blacklisting */
  @Get('lookup')
  @ApiOperation({ summary: 'Look up a worker by phone, email, or worker ID' })
  lookup(
    @Query('identifier') identifier: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.lookupWorker(identifier, user.institutionId)
  }

  @Get()
  @ApiOperation({ summary: 'List blacklisted workers' })
  getWorkers(@Query('page') page: number, @Query('limit') limit: number, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.getBlacklist(user.institutionId, Number(page) || 1, Number(limit) || 20)
  }

  @Get('organisations')
  @ApiOperation({ summary: 'List blacklisted organisations' })
  getOrgs(@Query('page') page: number, @Query('limit') limit: number, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.getBlacklistedOrganisations(user.institutionId, Number(page) || 1, Number(limit) || 20)
  }

  @Get('audit')
  @ApiOperation({ summary: 'Audit trail of all blacklist actions for this institution' })
  getAudit(@Query('page') page: number, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.getAuditTrail(user.institutionId, Number(page) || 1)
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Blacklist a worker — accepts workerId, phone, or email' })
  blacklistWorker(@Body() dto: BlacklistWorkerDto, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.blacklistWorker(dto, user.institutionId, user.sub)
  }

  @Post('remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a worker from the blacklist' })
  unblacklist(@Body() dto: UnblacklistDto, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.unblacklistWorker(dto, user.institutionId, user.sub)
  }

  @Post('organisations/add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Blacklist an organisation' })
  blacklistOrg(@Body() dto: BlacklistOrgDto, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.blacklistOrganisation(dto, user.institutionId, user.sub)
  }

  @Post('organisations/:id/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an organisation from the blacklist' })
  unblacklistOrg(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.svc.unblacklistOrganisation(id, body.reason, user.institutionId, user.sub)
  }

  @Post('workers/:workerId/dispute')
  @HttpCode(HttpStatus.OK)
  submitDispute(@Param('workerId') workerId: string, @Body() body: { reason: string; evidenceUrl?: string }, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.submitDispute(workerId, user.sub, user.institutionId, body.reason, body.evidenceUrl)
  }

  @Post('workers/:workerId/resolve-dispute')
  @HttpCode(HttpStatus.OK)
  resolveDispute(@Param('workerId') workerId: string, @Body() body: { resolution: 'UPHELD' | 'OVERTURNED'; notes: string }, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.resolveDispute(workerId, body.resolution, user.sub, user.institutionId, body.notes)
  }
}
