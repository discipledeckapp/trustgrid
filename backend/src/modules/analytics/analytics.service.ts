import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustScoreService } from '../trust-score/trust-score.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScoreService: TrustScoreService,
  ) {}

  async getDashboard(institutionId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalWorkers,
      verifiedWorkers,
      availableWorkers,
      serviceRequestsThisMonth,
      completedThisMonth,
      inProgress,
      openIncidents,
      resolvedThisMonth,
      criticalOpen,
      topWorkers,
      recentActivity,
    ] = await Promise.all([
      this.prisma.workerProfile.count({ where: { institutionId, isActive: true } }),
      this.prisma.workerProfile.count({
        where: { institutionId, isActive: true, verificationStatus: 'FULLY_VERIFIED' },
      }),
      this.prisma.workerProfile.count({
        where: { institutionId, isActive: true, isAvailable: true },
      }),
      this.prisma.serviceRequest.count({
        where: { institutionId, createdAt: { gte: monthStart } },
      }),
      this.prisma.serviceRequest.count({
        where: { institutionId, status: 'COMPLETED', completedAt: { gte: monthStart } },
      }),
      this.prisma.serviceRequest.count({
        where: { institutionId, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } },
      }),
      this.prisma.incidentReport.count({
        where: { institutionId, status: { in: ['OPEN', 'UNDER_INVESTIGATION'] } },
      }),
      this.prisma.incidentReport.count({
        where: { institutionId, status: 'RESOLVED', resolvedAt: { gte: monthStart } },
      }),
      this.prisma.incidentReport.count({
        where: { institutionId, severity: 'CRITICAL', status: { in: ['OPEN', 'UNDER_INVESTIGATION'] } },
      }),
      this.prisma.workerProfile.findMany({
        where: { institutionId, isActive: true },
        include: { user: { select: { firstName: true, lastName: true, profilePhotoUrl: true } } },
        orderBy: { trustScore: 'desc' },
        take: 5,
      }),
      this.prisma.trustEvent.findMany({
        where: { institutionId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { worker: { include: { user: { select: { firstName: true, lastName: true } } } } },
      }),
    ]);

    const avgTrustScore = await this.prisma.workerProfile.aggregate({
      where: { institutionId, isActive: true },
      _avg: { trustScore: true },
    });

    return {
      workforce: {
        totalWorkers,
        verifiedWorkers,
        verifiedPercentage: totalWorkers > 0 ? Math.round((verifiedWorkers / totalWorkers) * 100) : 0,
        availableWorkers,
        averageTrustScore: Math.round((avgTrustScore._avg.trustScore ?? 0) * 10) / 10,
      },
      serviceRequests: {
        totalThisMonth: serviceRequestsThisMonth,
        completedThisMonth,
        inProgress,
        completionRate: serviceRequestsThisMonth > 0
          ? Math.round((completedThisMonth / serviceRequestsThisMonth) * 100)
          : 0,
      },
      incidents: {
        openCount: openIncidents,
        resolvedThisMonth,
        criticalOpen,
      },
      topWorkers: topWorkers.map(w => {
        const grade = this.trustScoreService.getGrade(w.trustScore);
        return {
          id: w.id,
          name: `${w.user.firstName} ${w.user.lastName}`,
          profilePhotoUrl: w.user.profilePhotoUrl,
          primarySkill: w.primarySkill,
          trustScore: w.trustScore,
          trustGrade: grade.grade,
          trustGradeColor: grade.color,
          totalDeployments: w.totalDeployments,
          averageRating: w.averageRating,
          verificationStatus: w.verificationStatus,
        };
      }),
      trustedOrganisations: await this.prisma.organisation.findMany({
        where: { institutionId, verificationStatus: 'VERIFIED' },
        select: {
          id: true, name: true, type: true, logoUrl: true,
          rcNumber: true, verifiedAt: true,
          _count: { select: { workers: true } },
        },
        orderBy: { verifiedAt: 'desc' },
        take: 6,
      }),
      recentActivity: recentActivity.map(e => ({
        id: e.id,
        eventType: e.eventType,
        delta: e.delta,
        workerName: e.worker
          ? `${e.worker.user.firstName} ${e.worker.user.lastName}`
          : null,
        createdAt: e.createdAt,
      })),
    };
  }

  async getTrustDistribution(institutionId: string) {
    const workers = await this.prisma.workerProfile.findMany({
      where: { institutionId, isActive: true },
      select: { trustScore: true },
    });

    const total = workers.length;
    if (total === 0) {
      return { distribution: [], averageScore: 0, medianScore: 0, workforce: 0 };
    }

    const ranges = [
      { label: '90-100', min: 90, max: 100 },
      { label: '80-89', min: 80, max: 89 },
      { label: '70-79', min: 70, max: 79 },
      { label: '60-69', min: 60, max: 69 },
      { label: '50-59', min: 50, max: 59 },
      { label: '0-49', min: 0, max: 49 },
    ];

    const scores = workers.map(w => w.trustScore).sort((a, b) => a - b);
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    const median = scores[Math.floor(scores.length / 2)];

    const distribution = ranges.map(range => {
      const count = scores.filter(s => s >= range.min && s <= range.max).length;
      return {
        range: range.label,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      };
    });

    return {
      distribution,
      averageScore: Math.round(avg * 10) / 10,
      medianScore: Math.round(median * 10) / 10,
      workforce: total,
    };
  }
}
