import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkforceService } from '../workforce/workforce.service';

export interface CreateServiceRequestDto {
  title: string;
  description: string;
  categoryId: string;
  requiredSkills: string[];
  workersNeeded: number;
  minimumTrustScore?: number;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  estimatedHours?: number;
  locationAddress?: string;
  locationZoneId?: string;
  priority?: string;
  notes?: string;
}

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workforceService: WorkforceService,
  ) {}

  async create(dto: CreateServiceRequestDto, institutionId: string, requesterId: string) {
    const request = await this.prisma.serviceRequest.create({
      data: {
        institutionId,
        requesterId,
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        requiredSkills: dto.requiredSkills,
        workersNeeded: dto.workersNeeded,
        minimumTrustScore: dto.minimumTrustScore,
        scheduledStartAt: dto.scheduledStartAt,
        scheduledEndAt: dto.scheduledEndAt,
        estimatedHours: dto.estimatedHours,
        locationAddress: dto.locationAddress,
        locationZoneId: dto.locationZoneId,
        priority: dto.priority ?? 'NORMAL',
        notes: dto.notes,
        status: 'DRAFT',
      },
    });

    // Count matching workers for feedback
    const minScore = dto.minimumTrustScore ?? 0;
    const matched = await this.workforceService.findMatchingWorkers(
      institutionId,
      dto.requiredSkills,
      minScore,
      dto.categoryId,
    );

    return { ...request, matchedWorkers: matched.length };
  }

  async list(institutionId: string, status?: string, page = 1, limit = 20) {
    const where: any = { institutionId };
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return {
      data: requests,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, institutionId: string) {
    const request = await this.prisma.serviceRequest.findFirst({
      where: { id, institutionId },
      include: {
        assignment: {
          include: {
            assignmentWorkers: {
              include: {
                worker: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!request) throw new NotFoundException('Service request not found');
    return request;
  }

  async submit(id: string, institutionId: string) {
    const request = await this.prisma.serviceRequest.findFirst({
      where: { id, institutionId },
    });
    if (!request) throw new NotFoundException('Service request not found');
    if (request.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT requests can be submitted');
    }

    return this.prisma.serviceRequest.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });
  }

  async getMatchedWorkers(id: string, institutionId: string) {
    const request = await this.getById(id, institutionId);

    return this.workforceService.findMatchingWorkers(
      institutionId,
      request.requiredSkills,
      request.minimumTrustScore ?? 0,
      request.categoryId,
    );
  }

  async assignWorkers(
    requestId: string,
    institutionId: string,
    workerIds: string[],
    assignedById: string,
  ) {
    const request = await this.getById(requestId, institutionId);

    if (!['SUBMITTED', 'REVIEWING'].includes(request.status)) {
      throw new BadRequestException('Request must be submitted before assigning workers');
    }

    const assignment = await this.prisma.workforceAssignment.create({
      data: {
        institutionId,
        serviceRequestId: requestId,
        title: request.title,
        assignedById,
        status: 'PENDING_ACCEPTANCE',
        assignmentWorkers: {
          create: workerIds.map((workerId, idx) => ({
            workerId,
            role: idx === 0 ? 'LEAD' : 'WORKER',
            status: 'PENDING_ACCEPTANCE',
          })),
        },
      },
      include: { assignmentWorkers: true },
    });

    await this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: 'ASSIGNED' },
    });

    return assignment;
  }

  async complete(id: string, institutionId: string, completionNotes?: string) {
    const request = await this.getById(id, institutionId);
    if (request.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Request must be IN_PROGRESS to complete');
    }

    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.serviceRequest.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      }),
      this.prisma.workforceAssignment.updateMany({
        where: { serviceRequestId: id },
        data: { status: 'COMPLETED', completedAt: new Date(), completionNotes },
      }),
    ]);

    return updatedRequest;
  }

  // ── Emergency Mobilisation ────────────────────────────────────────────────
  /**
   * Instantly finds the best available verified workers for an emergency.
   * Creates a SUBMITTED service request and returns matched workers for quick assignment.
   * Used for: power outages, security incidents, medical emergencies.
   */
  async mobilise(dto: {
    skill: string
    description: string
    locationAddress?: string
    locationZoneId?: string
    minimumTrustScore?: number
    workersNeeded?: number
    urgency?: 'NORMAL' | 'HIGH' | 'CRITICAL'
  }, institutionId: string, requesterId: string) {
    const minScore = dto.minimumTrustScore ?? 50
    const needed   = dto.workersNeeded ?? 3

    // Find matching workers immediately
    const matched = await this.workforceService.findMatchingWorkers(
      institutionId,
      [dto.skill],
      minScore,
      undefined,
      20,
    )

    // Auto-create and submit the service request
    const request = await this.prisma.serviceRequest.create({
      data: {
        institutionId,
        requesterId,
        title: `EMERGENCY: ${dto.skill} needed`,
        description: dto.description,
        categoryId: `cat_${dto.skill.toLowerCase().replace(/\s+/g, '_')}`,
        requiredSkills: [dto.skill],
        workersNeeded: needed,
        minimumTrustScore: minScore,
        locationAddress: dto.locationAddress,
        locationZoneId: dto.locationZoneId,
        priority: dto.urgency ?? 'HIGH',
        status: 'SUBMITTED',
        notes: '⚡ Emergency mobilisation — auto-created',
      },
    })

    return {
      mobilisationId: request.id,
      requestId: request.id,
      matched: matched.slice(0, 10),
      totalAvailable: matched.length,
      enoughWorkers: matched.length >= needed,
      message: matched.length > 0
        ? `Found ${matched.length} available ${dto.skill}s. Top ${Math.min(needed, matched.length)} shown below.`
        : `No available verified ${dto.skill}s found. Try lowering the minimum trust score.`,
    }
  }
}
