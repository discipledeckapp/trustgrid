import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TrustPassportService } from './trust-passport.service'
import { CredentialExpiryService } from './credential-expiry.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Trust Passport')
@Controller('passport')
export class TrustPassportController {
  constructor(
    private readonly trustPassportService: TrustPassportService,
    private readonly credentialExpiry: CredentialExpiryService,
  ) {}

  // ── Public — no auth needed ───────────────────────────────────────────────

  @Get('verify/:passportCode')
  @ApiOperation({
    summary: 'Public passport verification — scan QR code to verify. Returns non-PII trust signals.',
    description: 'Accessible without authentication. Used by security scanners, gate systems, and anyone scanning a Trust Passport QR code.',
  })
  verify(@Param('passportCode') passportCode: string) {
    return this.trustPassportService.verifyByCode(passportCode)
  }

  // ── Protected ─────────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my Trust Passport — creates one if it does not exist' })
  getMyPassport(@CurrentUser() user: CurrentUserPayload) {
    return this.trustPassportService.getMyPassport(user.sub, user.institutionId)
  }

  @Get('users/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full passport for a user — PII visible to institution admin only' })
  getPassport(@Param('userId') userId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.trustPassportService.getFullPassport(userId, user.institutionId, user.role)
  }

  @Post('credentials')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a Trust Credential to a passport (requires authority role)' })
  issueCredential(
    @Body() body: {
      passportId: string
      credentialType: string
      label: string
      description?: string
      category?: string
      issuingNodeId?: string
      issuingRoleName?: string
      expiresAt?: string
      metadata?: Record<string, unknown>
    },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trustPassportService.issueCredential({
      ...body,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      issuingUserId: user.sub,
      institutionId: user.institutionId,
    })
  }

  @Post('credentials/:credentialId/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a Trust Credential' })
  revokeCredential(
    @Param('credentialId') credentialId: string,
    @Body() body: { reason: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trustPassportService.revokeCredential(credentialId, user.sub, body.reason)
  }

  @Get('credentials/expiring-soon')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Credentials expiring within 30 days — for operator dashboard alerts' })
  getExpiringCredentials(@CurrentUser() user: CurrentUserPayload) {
    return this.trustPassportService.getExpiringCredentials(user.institutionId)
  }

  @Post('credentials/trigger-expiry-check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger credential expiry check and send alerts' })
  triggerExpiryCheck() {
    return this.credentialExpiry.triggerCheck()
  }
}
