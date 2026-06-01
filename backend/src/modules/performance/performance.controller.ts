import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService, CreatePerformanceReviewDto } from './performance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Performance Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('performance-reviews')

export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a performance review for a worker or vendor' })
  async submit(
    @Body() dto: CreatePerformanceReviewDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.performanceService.submitReview(dto, user.institutionId, user.sub);
  }

  @Get('worker/:workerId')
  @ApiOperation({ summary: 'Get performance reviews for a worker' })
  async getWorkerReviews(
    @Param('workerId') workerId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.performanceService.getWorkerReviews(workerId, user.institutionId, page, limit);
  }
}
