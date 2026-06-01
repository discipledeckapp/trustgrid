import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get institution overview dashboard' })
  async getDashboard(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getDashboard(user.institutionId);
  }

  @Get('trust-distribution')
  @ApiOperation({ summary: 'Get trust score distribution across workforce' })
  async getTrustDistribution(@CurrentUser() user: CurrentUserPayload) {
    return this.analyticsService.getTrustDistribution(user.institutionId);
  }
}
