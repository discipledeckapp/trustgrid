import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalInstitutions,
      totalWorkers,
      totalVerifiedWorkers,
      totalPassports,
      activeSubscriptions,
      recentInstitutions,
    ] = await Promise.all([
      this.prisma.institution.count(),
      this.prisma.workerProfile.count({ where: { isActive: true } }),
      this.prisma.workerProfile.count({ where: { isActive: true, verificationStatus: 'FULLY_VERIFIED' } }),
      this.prisma.trustPassport.count(),
      this.prisma.institution.count({ where: { isActive: true } }),
      this.prisma.institution.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { _count: { select: { workerProfiles: true } } },
      }),
    ])

    return {
      totalInstitutions,
      totalWorkers,
      totalVerifiedWorkers,
      totalPassports,
      activeSubscriptions,
      mrr: 0,
      recentInstitutions: recentInstitutions.map(institution => ({
        ...institution,
        workerCount: institution._count.workerProfiles,
      })),
    }
  }

  async listInstitutions(limit: number) {
    const take = this.safeLimit(limit)
    const [data, total] = await Promise.all([
      this.prisma.institution.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        include: { _count: { select: { workerProfiles: true } } },
      }),
      this.prisma.institution.count(),
    ])

    return { data, total }
  }

  async listWorkers(params: { limit: number; minTrustScore?: number; verificationStatus?: string }) {
    const where: any = { isActive: true }
    if (Number.isFinite(params.minTrustScore)) where.trustScore = { gte: params.minTrustScore }
    if (params.verificationStatus) where.verificationStatus = params.verificationStatus

    const [workers, total] = await Promise.all([
      this.prisma.workerProfile.findMany({
        where,
        orderBy: { trustScore: 'desc' },
        take: this.safeLimit(params.limit),
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.workerProfile.count({ where }),
    ])

    return {
      data: workers.map(worker => ({
        ...worker,
        firstName: worker.user.firstName,
        lastName: worker.user.lastName,
        trustGrade: this.getTrustGrade(worker.trustScore),
      })),
      pagination: { total },
    }
  }

  async listOrganisations(limit: number) {
    const [data, total] = await Promise.all([
      this.prisma.organisation.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: this.safeLimit(limit),
      }),
      this.prisma.organisation.count({ where: { isActive: true } }),
    ])

    return {
      data: data.map(organisation => ({ ...organisation, companyName: organisation.name })),
      pagination: { total },
    }
  }

  async listPassports(limit: number) {
    const passports = await this.prisma.trustPassport.findMany({
      orderBy: { issuedAt: 'desc' },
      take: this.safeLimit(limit),
    })
    const userIds = passports.map(passport => passport.userId)
    const institutionIds = passports.map(passport => passport.institutionId)
    const [users, institutions, total] = await Promise.all([
      this.prisma.userAccount.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true },
      }),
      this.prisma.institution.findMany({
        where: { id: { in: institutionIds } },
        select: { id: true, name: true },
      }),
      this.prisma.trustPassport.count(),
    ])
    const usersById = new Map(users.map(user => [user.id, user]))
    const institutionsById = new Map(institutions.map(institution => [institution.id, institution]))

    return {
      data: passports.map(passport => {
        const user = usersById.get(passport.userId)
        return {
          ...passport,
          holderName: user ? `${user.firstName} ${user.lastName}` : 'Unknown user',
          institution: institutionsById.get(passport.institutionId),
        }
      }),
      total,
    }
  }

  async revokePassport(id: string) {
    const passport = await this.prisma.trustPassport.findUnique({ where: { id } })
    if (!passport) throw new NotFoundException('Passport not found')
    return this.prisma.trustPassport.update({ where: { id }, data: { status: 'REVOKED' } })
  }

  private safeLimit(limit: number) {
    return Math.min(Math.max(limit, 1), 100)
  }

  private getTrustGrade(score: number) {
    if (score >= 85) return 'A+'
    if (score >= 70) return 'A'
    if (score >= 55) return 'B'
    if (score >= 40) return 'C'
    return 'D'
  }
}
