import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async submitReview(
    dto: CreatePerformanceReviewDto,
    institutionId: string,
    reviewedById: string,
    reviewerRole: string,
  ) {
    if (!dto.serviceRequestId) {
      throw new BadRequestException('A performance review must reference a completed service request');
    }
    if (dto.overallRating < 1 || dto.overallRating > 5) {
      throw new BadRequestException('Overall rating must be between 1 and 5');
    }

    const request = await this.prisma.serviceRequest.findFirst({
      where: { id: dto.serviceRequestId, institutionId },
      include: {
        assignment: {
          include: { assignmentWorkers: true },
        },
      },
    });
    if (!request) throw new NotFoundException('Service request not found');
    if (request.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed service requests can be reviewed');
    }
    if (reviewerRole === 'RESIDENT' && request.requesterId !== reviewedById) {
      throw new ForbiddenException('Residents can only review their own service requests');
    }

    if (dto.workerId) {
      const worker = await this.prisma.workerProfile.findFirst({
        where: { id: dto.workerId, institutionId },
      });
      if (!worker) throw new NotFoundException('Worker not found');
      const wasAssigned = request.assignment?.assignmentWorkers.some((aw) => aw.workerId === dto.workerId);
      if (!wasAssigned) throw new BadRequestException('Worker was not assigned to this service request');
    }

    if (dto.vendorId) {
      const vendor = await this.prisma.vendorProfile.findFirst({
        where: { id: dto.vendorId, institutionId },
      });
      if (!vendor) throw new NotFoundException('Vendor not found');
    }

    const existing = await this.prisma.performanceReview.findFirst({
      where: {
        institutionId,
        reviewedById,
        serviceRequestId: dto.serviceRequestId,
        workerId: dto.workerId ?? null,
        vendorId: dto.vendorId ?? null,
      },
    });
    if (existing) throw new ConflictException('You have already reviewed this work');

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
