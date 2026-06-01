import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CacheService } from '../../common/redis/cache.service'

@Injectable()
export class InstitutionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getMyInstitution(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: { config: true },
    })
    if (!institution) throw new NotFoundException('Institution not found')
    return institution
  }

  async updateInstitution(
    institutionId: string,
    data: { name?: string; phone?: string; address?: string; city?: string; state?: string },
  ) {
    return this.prisma.institution.update({
      where: { id: institutionId },
      data,
    })
  }

  async getConfig(institutionId: string) {
    const config = await this.prisma.institutionConfig.findUnique({
      where: { institutionId },
    })
    if (!config) throw new NotFoundException('Config not found')
    return config
  }

  async updateConfig(institutionId: string, updates: Record<string, unknown>) {
    const existing = await this.prisma.institutionConfig.findUnique({
      where: { institutionId },
    })
    if (!existing) throw new NotFoundException('Config not found')

    const updated = await this.prisma.institutionConfig.update({
      where: { institutionId },
      data: updates,
    })

    // Invalidate dashboard cache when config changes
    await this.cache.del(this.cache.dashboardKey(institutionId))

    return updated
  }

  async listOperators(institutionId: string) {
    return this.prisma.userAccount.findMany({
      where: {
        institutionId,
        role: { in: ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'INSTITUTION_VIEWER'] },
        isActive: true,
      },
      select: {
        id: true, firstName: true, lastName: true,
        phone: true, email: true, role: true,
        lastLoginAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createOperator(
    institutionId: string,
    data: { firstName: string; lastName: string; phone: string; email?: string; role: string },
  ) {
    if (!['INSTITUTION_OPERATOR', 'INSTITUTION_VIEWER'].includes(data.role)) {
      throw new BadRequestException('Operator role must be INSTITUTION_OPERATOR or INSTITUTION_VIEWER')
    }

    return this.prisma.userAccount.create({
      data: {
        institutionId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        role: data.role as any,
      },
      select: {
        id: true, firstName: true, lastName: true,
        phone: true, email: true, role: true, createdAt: true,
      },
    })
  }
}
