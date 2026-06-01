import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustScoreService } from '../trust-score/trust-score.service';

export interface CreatePerformanceReviewDto {
  serviceRequestId?: string;
  workerId?: string;
  vendorId?: string;
  overallRating: number;
  qualityRating?: number;
  punctualityRating?: number;
  communicationRating?: number;
  comment?: string;
}

@Injectable()
export class PerformanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScoreService: TrustScoreService,
  ) {}

  async submitReview(dto: CreatePerformanceReviewDto, institutionId: string, reviewedById: string) {
    const review = await this.prisma.performanceReview.create({
      data: {
        institutionId,
        reviewedById,
        serviceRequestId: dto.serviceRequestId,
        workerId: dto.workerId,
        vendorId: dto.vendorId,
        overallRating: dto.overallRating,
        qualityRating: dto.qualityRating,
        punctualityRating: dto.punctualityRating,
        communicationRating: dto.communicationRating,
        comment: dto.comment,
      },
    });

    if (dto.workerId) {
      // Update deployment stats
      await this.prisma.workerProfile.update({
        where: { id: dto.workerId },
        data: {
          totalDeployments: { increment: 1 },
          completedDeployments: { increment: 1 },
          lastActiveAt: new Date(),
        },
      });

      // Recompute average rating
      const reviews = await this.prisma.performanceReview.findMany({
        where: { workerId: dto.workerId, institutionId },
        select: { overallRating: true },
      });

      const avgRating =
        reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

      await this.prisma.workerProfile.update({
        where: { id: dto.workerId },
        data: { averageRating: Math.round(avgRating * 10) / 10 },
      });

      // Emit trust events: deployment completed + rating
      await this.trustScoreService.emitEvent({
        type: 'DEPLOYMENT_COMPLETED',
        workerId: dto.workerId,
        institutionId,
        referenceType: 'performance_review',
        referenceId: review.id,
        createdBy: reviewedById,
      });

      await this.trustScoreService.emitEvent({
        type: 'RATING_SUBMITTED',
        workerId: dto.workerId,
        institutionId,
        referenceType: 'performance_review',
        referenceId: review.id,
        createdBy: reviewedById,
        metadata: { rating: dto.overallRating },
      });
    }

    return review;
  }

  async getWorkerReviews(workerId: string, institutionId: string, page = 1, limit = 20) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const [reviews, total] = await Promise.all([
      this.prisma.performanceReview.findMany({
        where: { workerId, institutionId, isPublic: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.performanceReview.count({ where: { workerId, institutionId } }),
    ]);

    return {
      data: reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
