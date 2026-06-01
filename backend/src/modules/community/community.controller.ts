import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CommunityService, CreateNodeTypeDto, CreateNodeDto, CreateMembershipDto } from './community.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Community Hierarchy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ── Node Types ────────────────────────────────────────────────────────────

  @Post('node-types')
  @ApiOperation({ summary: 'Create a community node type (Province, Area, Parish, etc.)' })
  createNodeType(@Body() dto: CreateNodeTypeDto, @CurrentUser() user: CurrentUserPayload) {
    return this.communityService.createNodeType(dto, user.institutionId)
  }

  @Get('node-types')
  @ApiOperation({ summary: 'Get all node types for this institution (the hierarchy definition)' })
  getNodeTypes(@CurrentUser() user: CurrentUserPayload) {
    return this.communityService.getNodeTypes(user.institutionId)
  }

  @Post('node-types/seed/rccg')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed Redemption City hierarchy node types (Global → Parish, 7 levels)' })
  seedRCCG(@CurrentUser() user: CurrentUserPayload) {
    return this.communityService.seedRCCGNodeTypes(user.institutionId, user.sub)
  }

  @Post('node-types/seed/estate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed Estate hierarchy node types (Estate → Block, 4 levels)' })
  seedEstate(@CurrentUser() user: CurrentUserPayload) {
    return this.communityService.seedEstateNodeTypes(user.institutionId)
  }

  // ── Community Nodes ───────────────────────────────────────────────────────

  @Post('nodes')
  @ApiOperation({ summary: 'Create a community node (a Parish, Area, Estate, etc.)' })
  createNode(@Body() dto: CreateNodeDto, @CurrentUser() user: CurrentUserPayload) {
    return this.communityService.createNode(dto, user.institutionId, user.sub)
  }

  @Get('nodes')
  @ApiOperation({ summary: 'Get community hierarchy from root (or specific node)' })
  getHierarchy(
    @Query('rootId') rootId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.getHierarchy(user.institutionId, rootId)
  }

  @Get('nodes/:id')
  @ApiOperation({ summary: 'Get a specific community node with children and stats' })
  getNode(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.communityService.getNode(id, user.institutionId)
  }

  @Get('nodes/:id/ancestors')
  @ApiOperation({ summary: 'Get the full ancestor chain for a node (breadcrumb path)' })
  getAncestors(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.communityService.getAncestors(id, user.institutionId)
  }

  @Post('nodes/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a community node (e.g. Area verifies a Parish)' })
  verifyNode(
    @Param('id') id: string,
    @Body() body: { verifyingNodeId: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.verifyNode(id, user.institutionId, user.sub, body.verifyingNodeId)
  }

  // ── Memberships ───────────────────────────────────────────────────────────

  @Post('nodes/:id/members')
  @ApiOperation({ summary: 'Add a member to a community node' })
  addMembership(
    @Param('id') nodeId: string,
    @Body() body: { userId: string; type?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.addMembership(
      { ...body, nodeId },
      user.institutionId,
      user.sub,
    )
  }

  @Get('nodes/:id/members')
  @ApiOperation({ summary: 'List members of a community node' })
  getMembers(
    @Param('id') nodeId: string,
    @Query('status') status: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.getMembers(nodeId, user.institutionId, status)
  }

  @Post('memberships/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending membership application' })
  approveMembership(
    @Param('id') membershipId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.approveMembership(membershipId, user.institutionId, user.sub)
  }
}
