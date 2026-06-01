import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustScoreService } from '../trust-score/trust-score.service';
import { CreateWorkerDto, WorkerFilterDto } from './dto/create-worker.dto';

@Injectable()
export class WorkforceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScoreService: TrustScoreService,
  ) {}

  async createWorker(dto: CreateWorkerDto, institutionId: string, createdBy: string) {
    // Check for existing account with same phone in this institution
    const existing = await this.prisma.userAccount.findFirst({
      where: { phone: dto.phone, institutionId },
    });
    if (existing) {
      throw new ConflictException('A worker with this phone number already exists');
    }

    const user = await this.prisma.userAccount.create({
      data: {
        institutionId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        role: 'WORKER',
      },
    });

    const worker = await this.prisma.workerProfile.create({
      data: {
        institutionId,
        userId: user.id,
        primarySkill: dto.primarySkill,
        skills: dto.skills ?? [dto.primarySkill],
        categoryIds: dto.categoryIds ?? [],
        workerType: dto.workerType ?? 'CONTRACTOR',
        yearsExperience: dto.yearsExperience,
        bio: dto.bio,
        hourlyRate: dto.hourlyRate,
        dailyRate: dto.dailyRate,
      },
    });

    // Emit account created trust event
    await this.trustScoreService.emitEvent({
      type: 'ACCOUNT_CREATED',
      workerId: worker.id,
      institutionId,
      createdBy,
    });

    return this.getWorkerById(worker.id, institutionId);
  }

  async listWorkers(institutionId: string, filter: WorkerFilterDto) {
    const page = filter.page ?? 1;
    const limit = Math.min(filter.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { institutionId, isActive: true };

    if (filter.skill) {
      where.OR = [
        { primarySkill: { contains: filter.skill, mode: 'insensitive' } },
        { skills: { has: filter.skill } },
      ];
    }
    if (filter.categoryId) {
      where.categoryIds = { has: filter.categoryId };
    }
    if (filter.verificationStatus) {
      where.verificationStatus = filter.verificationStatus;
    }
    if (filter.minTrustScore !== undefined) {
      where.trustScore = { gte: Number(filter.minTrustScore) };
    }
    if (filter.isAvailable === 'true') {
      where.isAvailable = true;
    }
    if (filter.search) {
      where.OR = [
        ...(where.OR ?? []),
        { user: { firstName: { contains: filter.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filter.search, mode: 'insensitive' } } },
        { primarySkill: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = filter.sortBy ?? 'trustScore';
    const sortOrder = filter.sortOrder ?? 'desc';

    const orderBy: any =
      sortBy === 'trustScore' ? { trustScore: sortOrder } :
      sortBy === 'name' ? [{ user: { firstName: sortOrder } }] :
      sortBy === 'createdAt' ? { createdAt: sortOrder } :
      { trustScore: 'desc' };

    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, profilePhotoUrl: true, phone: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.workerProfile.count({ where }),
    ]);

    return {
      data: workers.map(w => this.formatWorkerSummary(w)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWorkerById(workerId: string, institutionId: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            profilePhotoUrl: true,
          },
        },
        identityVerification: {
          select: { status: true, providerName: true, verifiedAt: true },
        },
        credentials: true,
        endorsementsReceived: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        performanceReviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        incidents: {
          select: { id: true, severity: true, status: true, incidentDate: true },
          orderBy: { incidentDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const gradeInfo = this.trustScoreService.getGrade(worker.trustScore);

    return {
      id: worker.id,
      firstName: worker.user.firstName,
      lastName: worker.user.lastName,
      phone: worker.user.phone,
      email: worker.user.email,
      profilePhotoUrl: worker.user.profilePhotoUrl,
      primarySkill: worker.primarySkill,
      skills: worker.skills,
      categoryIds: worker.categoryIds,
      workerType: worker.workerType,
      bio: worker.bio,
      yearsExperience: worker.yearsExperience,
      isAvailable: worker.isAvailable,
      verificationStatus: worker.verificationStatus,
      identityVerified: worker.identityVerification?.status === 'FULLY_VERIFIED',
      trustScore: worker.trustScore,
      trustGrade: gradeInfo.grade,
      trustGradeLabel: gradeInfo.label,
      trustGradeColor: gradeInfo.color,
      totalDeployments: worker.totalDeployments,
      completedDeployments: worker.completedDeployments,
      completionRate: worker.totalDeployments > 0
        ? worker.completedDeployments / worker.totalDeployments
        : null,
      averageRating: worker.averageRating,
      totalEndorsements: worker.totalEndorsements,
      endorsements: worker.endorsementsReceived,
      recentReviews: worker.performanceReviews,
      incidentHistory: {
        total: worker.incidents.length,
        open: worker.incidents.filter(i => ['OPEN', 'UNDER_INVESTIGATION'].includes(i.status)).length,
        resolved: worker.incidents.filter(i => i.status === 'RESOLVED').length,
      },
      credentials: worker.credentials,
      hourlyRate: worker.hourlyRate,
      dailyRate: worker.dailyRate,
      currency: worker.currency,
      joinedAt: worker.joinedAt,
      lastActiveAt: worker.lastActiveAt,
    };
  }

  async updateAvailability(workerId: string, institutionId: string, isAvailable: boolean) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return this.prisma.workerProfile.update({
      where: { id: workerId },
      data: { isAvailable, lastActiveAt: new Date() },
    });
  }

  async findMatchingWorkers(
    institutionId: string,
    requiredSkills: string[],
    minTrustScore: number,
    categoryId?: string,
    limit = 100,
  ) {
    const where: any = {
      institutionId,
      isActive: true,
      isAvailable: true,
      trustScore: { gte: minTrustScore },
      OR: requiredSkills.map(skill => ({
        OR: [
          { primarySkill: { contains: skill, mode: 'insensitive' } },
          { skills: { has: skill } },
        ],
      })),
    };

    if (categoryId) {
      where.categoryIds = { has: categoryId };
    }

    const workers = await this.prisma.workerProfile.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, profilePhotoUrl: true },
        },
      },
      orderBy: { trustScore: 'desc' },
      take: limit,
    });

    return workers.map(w => this.formatWorkerSummary(w));
  }

  private formatWorkerSummary(w: any) {
    const gradeInfo = this.trustScoreService.getGrade(w.trustScore);
    return {
      id: w.id,
      firstName: w.user.firstName,
      lastName: w.user.lastName,
      profilePhotoUrl: w.user.profilePhotoUrl,
      primarySkill: w.primarySkill,
      skills: w.skills,
      trustScore: w.trustScore,
      trustGrade: gradeInfo.grade,
      trustGradeColor: gradeInfo.color,
      verificationStatus: w.verificationStatus,
      totalDeployments: w.totalDeployments,
      averageRating: w.averageRating,
      endorsementCount: w.totalEndorsements,
      isAvailable: w.isAvailable,
    };
  }
}
