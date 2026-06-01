import {
  Controller, Get, Post, Body, Param,
  Query, UseGuards, Res, HttpCode, HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IdentityService, InitiateVerificationDto, CACVerifyDto } from './identity.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Identity Verification')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Get('supported-types')
  @ApiOperation({ summary: 'Get supported ID types, liveness availability, and encryption status for a country' })
  getSupportedTypes(@Query('country') country: string = 'NG') {
    return this.identityService.getSupportedIdTypes(country)
  }

  // ── Protected ─────────────────────────────────────────────────────────────

  @Post('liveness/create-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Rekognition Face Liveness session (Pathway 1 — returns sessionId for frontend)' })
  createLivenessSession() {
    return this.identityService.createLivenessSession()
  }

  @Get('liveness/result/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get liveness check result + reference image after frontend completes the check' })
  getLivenessResult(@Param('sessionId') sessionId: string) {
    return this.identityService.getLivenessStatus(sessionId)
  }

  @Post('workers/:workerId/photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload a photo for any worker (all pathways, all statuses). Photo is stored encrypted.',
  })
  uploadPhoto(
    @Param('workerId') workerId: string,
    @Body() body: { photoBase64: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.identityService.uploadWorkerPhoto(workerId, user.institutionId, body.photoBase64)
  }

  @Post('workers/:workerId/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate identity verification — never a hard block. Live photo stored regardless of outcome.',
    description: `
Supports three pathways:
- Pathway 1 (liveness): pass livenessSessionId → Rekognition reference image used as live photo
- Pathway 2 (selfie):   pass livePhotoBase64 directly
- Pathway 3 (agent):    agent passes livePhotoBase64 on worker's behalf (no smartphone needed)

In all cases, the live photo is stored encrypted on the worker profile.
`,
  })
  initiateVerification(
    @Param('workerId') workerId: string,
    @Body() dto: InitiateVerificationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.identityService.initiateVerification(workerId, user.institutionId, dto)
  }

  @Get('workers/:workerId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Poll verification status — safe to call repeatedly' })
  getStatus(
    @Param('workerId') workerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.identityService.getVerificationStatus(workerId, user.institutionId)
  }

  @Get('workers/:workerId/details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get verified identity details — consent-gated. Institution operators see legal name + DOB year.',
    description: 'Decrypted PII is only returned to INSTITUTION_ADMIN and INSTITUTION_OPERATOR roles.',
  })
  getDetails(
    @Param('workerId') workerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.identityService.getVerifiedDetails(
      workerId, user.institutionId, user.role,
    )
  }

  @Get('workers/:workerId/photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get worker live photo as base64 JPEG — decrypted and served securely',
    description: 'Only accessible by institution operators and the worker themselves.',
  })
  async getPhoto(
    @Param('workerId') workerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const photo = await this.identityService.getWorkerPhoto(
      workerId, user.institutionId, user.role,
    )
    if (!photo) return { photo: null, hasPhoto: false }
    return { photo, hasPhoto: true }
  }

  @Post('organisations/:organisationId/verify-cac')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify organisation CAC (RC number) via Prembly — flags UNVERIFIED if not found, never blocks',
  })
  verifyCAC(
    @Param('organisationId') organisationId: string,
    @Body() dto: CACVerifyDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.identityService.verifyOrganisationCAC(organisationId, user.institutionId, dto)
  }
}
