import {
  ForbiddenException,
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustScoreService } from '../trust-score/trust-score.service';
import { CreateWorkerDto, WorkerFilterDto } from './dto/create-worker.dto';

@Injectable()
export class WorkforceService {
  private readonly logger = new Logger(WorkforceService.name);

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

    // Fetch global workers who are active community members of this institution
    const communityMemberships = await this.prisma.membership.findMany({
      where: { institutionId, status: 'ACTIVE' },
      select: { userId: true },
    });
    const globalWorkerUserIds = communityMemberships.map(m => m.userId);

    // AND: must belong to institution (scoped or global community member)
    const institutionScope = {
      OR: [
        { institutionId },
        { isGlobal: true, userId: { in: globalWorkerUserIds } },
      ],
    };

    const andFilters: any[] = [institutionScope, { isActive: true }];

    if (filter.skill) {
      andFilters.push({
        OR: [
          { primarySkill: { contains: filter.skill, mode: 'insensitive' } },
          { skills: { has: filter.skill } },
        ],
      });
    }
    if (filter.categoryId) {
      andFilters.push({ categoryIds: { has: filter.categoryId } });
    }
    if (filter.verificationStatus) {
      andFilters.push({ verificationStatus: filter.verificationStatus });
    }
    if (filter.minTrustScore !== undefined) {
      andFilters.push({ trustScore: { gte: Number(filter.minTrustScore) } });
    }
    if (filter.isAvailable === 'true') {
      andFilters.push({ isAvailable: true });
    }
    if (filter.search) {
      andFilters.push({
        OR: [
          { user: { firstName: { contains: filter.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: filter.search, mode: 'insensitive' } } },
          { primarySkill: { contains: filter.search, mode: 'insensitive' } },
        ],
      });
    }

    const where: any = { AND: andFilters };

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

  async getWorkerById(
    workerId: string,
    institutionId: string,
    requesterId?: string,
    requesterRole?: string,
  ) {
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
    const canViewContact = !requesterRole ||
      ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'PLATFORM_ADMIN'].includes(requesterRole) ||
      worker.userId === requesterId;

    return {
      id: worker.id,
      firstName: worker.user.firstName,
      lastName: worker.user.lastName,
      phone: canViewContact ? worker.user.phone : undefined,
      email: canViewContact ? worker.user.email : undefined,
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

  async updateAvailability(
    workerId: string,
    institutionId: string,
    isAvailable: boolean,
    requesterId: string,
    requesterRole: string,
  ) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    if (requesterRole === 'WORKER' && worker.userId !== requesterId) {
      throw new ForbiddenException('Workers can only update their own availability');
    }

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
      verificationStatus: 'FULLY_VERIFIED',
      trustScore: { gte: minTrustScore },
    };

    if (requiredSkills.length > 0) {
      where.OR = requiredSkills.map(skill => ({
        OR: [
          { primarySkill: { contains: skill, mode: 'insensitive' } },
          { skills: { has: skill } },
        ],
      }))
    }

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

  async createMyProfile(userId: string, dto: {
    primarySkill: string;
    skills?: string[];
    bio?: string;
    yearsExperience?: number;
    categoryIds?: string[];
    hourlyRate?: number;
    dailyRate?: number;
  }) {
    // Check if global profile already exists
    const existing = await this.prisma.workerProfile.findFirst({
      where: { userId, institutionId: null },
    });
    if (existing) throw new ConflictException('You already have a global worker profile');

    const profile = await this.prisma.workerProfile.create({
      data: {
        userId,
        institutionId: null,      // global worker — not tied to one institution
        isGlobal: true,
        ownedByUserId: userId,
        primarySkill: dto.primarySkill,
        skills: dto.skills ?? [dto.primarySkill],
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        categoryIds: dto.categoryIds ?? [],
        hourlyRate: dto.hourlyRate,
        dailyRate: dto.dailyRate,
        workerType: 'FREELANCER' as any,
        verificationStatus: 'UNVERIFIED' as any,
      },
      include: { user: { select: { firstName: true, lastName: true, profilePhotoUrl: true } } },
    });

    this.logger.log({ userId, profileId: profile.id }, 'global_worker_profile_created');
    return profile;
  }

  async getMyProfile(userId: string) {
    const profiles = await this.prisma.workerProfile.findMany({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, profilePhotoUrl: true, email: true, phone: true } },
        identityVerification: { select: { status: true, verifiedAt: true, faceMatchPassed: true } },
      },
    });
    return { profiles, count: profiles.length };
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
