import {
  Controller, Get, Post, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus, Patch,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import {
  OnboardingService,
  StartWorkerOnboardingDto,
  WorkerSkillsStepDto,
  WorkerVerificationStepDto,
  WorkerAvailabilityStepDto,
  StartOrgOnboardingDto,
  OrgServicesStepDto,
  OrgTeamStepDto,
  ReviewApplicationDto,
} from './onboarding.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'

// Public endpoints (no auth required for self-registration)
@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ── Worker onboarding (public — no auth needed for self-registration) ────────

  @Post('worker/start')
  @ApiOperation({ summary: 'Step 1 — Start worker self-registration' })
  async startWorker(
    @Body() dto: StartWorkerOnboardingDto,
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.startWorkerOnboarding(dto, institutionId)
  }

  @Post('worker/skills')
  @ApiOperation({ summary: 'Step 2 — Save skills and rates' })
  async saveSkills(
    @Body() dto: WorkerSkillsStepDto,
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.saveWorkerSkills(dto, institutionId)
  }

  @Post('worker/verification')
  @ApiOperation({ summary: 'Step 3 — Submit identity verification' })
  async saveVerification(
    @Body() dto: WorkerVerificationStepDto,
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.saveWorkerVerification(dto, institutionId)
  }

  @Post('worker/credentials')
  @ApiOperation({ summary: 'Step 4 — Upload credentials' })
  async saveCredentials(
    @Body() body: { applicationId: string; credentials: Array<{ type: string; name: string }> },
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.saveWorkerCredentials(body.applicationId, institutionId, body.credentials)
  }

  @Post('worker/availability')
  @ApiOperation({ summary: 'Step 5 — Set availability and submit' })
  async saveAvailability(
    @Body() dto: WorkerAvailabilityStepDto,
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.saveWorkerAvailability(dto, institutionId)
  }

  // ── Organisation onboarding ──────────────────────────────────────────────────

  @Post('organisation/start')
  @ApiOperation({ summary: 'Step 1 — Start organisation registration' })
  async startOrg(
    @Body() dto: StartOrgOnboardingDto,
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.startOrgOnboarding(dto, institutionId)
  }

  @Post('organisation/services')
  @ApiOperation({ summary: 'Step 2 — Save services and coverage' })
  async saveOrgServices(
    @Body() dto: OrgServicesStepDto,
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.saveOrgServices(dto, institutionId)
  }

  @Post('organisation/documents')
  @ApiOperation({ summary: 'Step 3 — Upload company documents' })
  async saveOrgDocuments(
    @Body() body: { applicationId: string; documents: Array<{ type: string; name: string }> },
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.saveOrgDocuments(body.applicationId, institutionId, body.documents)
  }

  @Post('organisation/team')
  @ApiOperation({ summary: 'Step 4 — Set up team and branches, submit' })
  async saveOrgTeam(
    @Body() dto: OrgTeamStepDto,
    @Query('institutionId') institutionId: string,
  ) {
    return this.onboardingService.saveOrgTeam(dto, institutionId)
  }

  // ── Status check (public — applicant polls for their status) ─────────────────

  @Get('status/:applicationId')
  @ApiOperation({ summary: 'Check application status (no auth required)' })
  async getStatus(@Param('applicationId') applicationId: string) {
    return this.onboardingService.getApplicationStatus(applicationId)
  }

  // ── Admin review (requires auth) ─────────────────────────────────────────────

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'PLATFORM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List onboarding applications (institution admin)' })
  async listApplications(
    @Query('type') type: string,
    @Query('status') status: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.onboardingService.listApplications(user.institutionId, type, status, page, limit)
  }

  @Post('applications/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTITUTION_ADMIN', 'PLATFORM_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve, reject, or request more info on an application' })
  async reviewApplication(
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.onboardingService.reviewApplication(id, user.institutionId, dto, user.sub)
  }

  @Post('bulk-import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk import members from CSV data' })
  bulkImport(
    @Body() body: { members: Array<{ firstName: string; lastName: string; phone?: string; email?: string }> },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.onboardingService.bulkImport(body.members, user.institutionId, user.sub)
  }
}
