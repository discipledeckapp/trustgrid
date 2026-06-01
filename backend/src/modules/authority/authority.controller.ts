import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthorityService, CreateRoleDto, AssignRoleDto } from './authority.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Authority Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('authority')
export class AuthorityController {
  constructor(private readonly authorityService: AuthorityService) {}

  @Post('roles')
  @ApiOperation({ summary: 'Create an authority role (Parish Pastor, Area Coordinator, etc.)' })
  createRole(@Body() dto: CreateRoleDto, @CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.createRole(dto, user.institutionId)
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all authority roles for this institution' })
  getRoles(@CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.getRoles(user.institutionId)
  }

  @Post('roles/seed/rccg')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed standard RCCG authority roles' })
  seedRCCGRoles(@CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.seedRCCGRoles(user.institutionId)
  }

  @Post('assignments')
  @ApiOperation({ summary: 'Assign an authority role to a person at a community node' })
  assignRole(@Body() dto: AssignRoleDto, @CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.assignRole(dto, user.institutionId, user.sub)
  }

  @Post('assignments/:id/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an authority assignment' })
  revokeRole(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.authorityService.revokeRole(id, user.institutionId, user.sub, body.reason)
  }

  @Get('nodes/:nodeId/assignments')
  @ApiOperation({ summary: 'Get all authority assignments for a community node' })
  getNodeAssignments(@Param('nodeId') nodeId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.getAssignmentsForNode(nodeId, user.institutionId)
  }

  @Get('users/:userId/assignments')
  @ApiOperation({ summary: 'Get all authority assignments for a user' })
  getUserAssignments(@Param('userId') userId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.getAssignmentsForUser(userId, user.institutionId)
  }

  @Get('users/:userId/permissions')
  @ApiOperation({ summary: 'Get aggregated permissions for a user across all their authority roles' })
  getUserPermissions(@Param('userId') userId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.getUserPermissions(userId, user.institutionId)
  }

  @Get('me/permissions')
  @ApiOperation({ summary: 'Get my own authority permissions' })
  getMyPermissions(@CurrentUser() user: CurrentUserPayload) {
    return this.authorityService.getUserPermissions(user.sub, user.institutionId)
  }
}
