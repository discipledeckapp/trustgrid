import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrustScoreService } from './trust-score.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Trust Score')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workers')

export class TrustScoreController {
  constructor(private readonly trustScoreService: TrustScoreService) {}

  @Get(':workerId/trust-score')
  @ApiOperation({ summary: 'Get detailed trust score breakdown for a worker' })
  async getWorkerTrustScore(
    @Param('workerId') workerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.trustScoreService.getScoreBreakdown(workerId, user.institutionId);
  }
}
