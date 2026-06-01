import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CacheService } from '../../common/redis/cache.service'
import { UpdateBrandDto } from './dto/update-brand.dto'

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

  async getBrandByDomain(host: string): Promise<{
    found: boolean
    institutionId?: string
    slug?: string
    subdomain?: string
    customDomain?: string
    brandConfig?: Record<string, unknown>
    name?: string
  }> {
    if (!host) return { found: false }

    // Extract subdomain from "rccg.trustgrid.ng" → "rccg"
    const TRUSTGRID_DOMAIN = 'trustgrid.ng'
    let subdomain: string | null = null
    let customDomain: string | null = null

    // Strip port
    const cleanHost = host.split(':')[0].toLowerCase()

    if (cleanHost.endsWith(`.${TRUSTGRID_DOMAIN}`)) {
      subdomain = cleanHost.replace(`.${TRUSTGRID_DOMAIN}`, '')
      // Ignore reserved subdomains
      if (['app', 'admin', 'www', 'api', 'verify'].includes(subdomain)) {
        return { found: false }
      }
    } else if (!cleanHost.includes('trustgrid.ng') && !cleanHost.includes('localhost')) {
      customDomain = cleanHost
    } else {
      return { found: false }
    }

    const institution = await this.prisma.institution.findFirst({
      where: subdomain
        ? { subdomain, subdomainEnabled: true }
        : { customDomain, customDomainEnabled: true },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        customDomain: true,
        brandConfig: true,
      },
    })

    if (!institution) return { found: false }

    return {
      found: true,
      institutionId: institution.id,
      slug: institution.slug,
      subdomain: institution.subdomain ?? undefined,
      customDomain: institution.customDomain ?? undefined,
      brandConfig: (institution.brandConfig ?? {}) as Record<string, unknown>,
      name: institution.name,
    }
  }

  async updateBrand(institutionId: string, dto: UpdateBrandDto) {
    const data: Record<string, unknown> = {}

    if (dto.subdomain !== undefined) {
      // Check not taken
      const existing = await this.prisma.institution.findFirst({
        where: { subdomain: dto.subdomain, NOT: { id: institutionId } },
      })
      if (existing) throw new ConflictException('That subdomain is already taken')
      data.subdomain = dto.subdomain
      data.subdomainEnabled = true
    }

    if (dto.customDomain !== undefined) {
      const existing = await this.prisma.institution.findFirst({
        where: { customDomain: dto.customDomain, NOT: { id: institutionId } },
      })
      if (existing) throw new ConflictException('That custom domain is already taken')
      data.customDomain = dto.customDomain
      data.customDomainEnabled = true
    }

    if (dto.brandConfig) {
      // Merge into existing brandConfig
      const current = await this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { brandConfig: true },
      })
      data.brandConfig = { ...(current?.brandConfig as object ?? {}), ...dto.brandConfig }
    }

    return this.prisma.institution.update({
      where: { id: institutionId },
      data: data as any,
      select: { id: true, subdomain: true, customDomain: true, brandConfig: true, subdomainEnabled: true, customDomainEnabled: true },
    })
  }
}
