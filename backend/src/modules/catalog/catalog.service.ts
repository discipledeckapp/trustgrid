import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface CreateDomainDto {
  name: string
  description?: string
  icon?: string
  color?: string
  sortOrder?: number
}

export interface CreateCategoryDto {
  domainId: string
  name: string
  description?: string
  icon?: string
  color?: string
  skills?: string[]
  requiredCertifications?: string[]
  allowedWorkerTypes?: string[]
  defaultMinTrustScore?: number
  isProfessional?: boolean
  requiresLicence?: boolean
  sortOrder?: number
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  isActive?: boolean
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Platform catalog (read by everyone) ───────────────────────────────────

  async getFullCatalog(includeInactive = false) {
    const domains = await this.prisma.platformCatalogDomain.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        categories: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })
    return domains
  }

  async getCategories(domainId?: string, isProfessional?: boolean) {
    return this.prisma.platformCatalogCategory.findMany({
      where: {
        isActive: true,
        ...(domainId && { domainId }),
        ...(isProfessional !== undefined && { isProfessional }),
      },
      include: { domain: { select: { name: true } } },
      orderBy: [{ domain: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    })
  }

  async getCategoryById(id: string) {
    const cat = await this.prisma.platformCatalogCategory.findUnique({
      where: { id },
      include: { domain: true },
    })
    if (!cat) throw new NotFoundException('Category not found')
    return cat
  }

  // ── Platform admin — manage domains ──────────────────────────────────────

  async createDomain(dto: CreateDomainDto, createdById: string) {
    return this.prisma.platformCatalogDomain.create({
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        sortOrder: dto.sortOrder ?? 0,
      },
    })
  }

  async updateDomain(id: string, dto: Partial<CreateDomainDto> & { isActive?: boolean }) {
    const domain = await this.prisma.platformCatalogDomain.findUnique({ where: { id } })
    if (!domain) throw new NotFoundException('Domain not found')
    return this.prisma.platformCatalogDomain.update({ where: { id }, data: dto })
  }

  // ── Platform admin — manage categories ───────────────────────────────────

  async createCategory(dto: CreateCategoryDto, createdBy: string) {
    const slug = dto.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const existing = await this.prisma.platformCatalogCategory.findUnique({ where: { slug } })
    if (existing) throw new ConflictException(`Category "${dto.name}" already exists`)

    return this.prisma.platformCatalogCategory.create({
      data: {
        domainId: dto.domainId,
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon ?? 'briefcase',
        color: dto.color ?? '#6B7280',
        skills: dto.skills ?? [],
        requiredCertifications: dto.requiredCertifications ?? [],
        allowedWorkerTypes: dto.allowedWorkerTypes ?? ['CONTRACTOR', 'FREELANCER'],
        defaultMinTrustScore: dto.defaultMinTrustScore ?? 50,
        isProfessional: dto.isProfessional ?? false,
        requiresLicence: dto.requiresLicence ?? false,
        sortOrder: dto.sortOrder ?? 0,
        createdBy,
      },
      include: { domain: { select: { name: true } } },
    })
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.platformCatalogCategory.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException('Category not found')

    return this.prisma.platformCatalogCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.requiredCertifications !== undefined && { requiredCertifications: dto.requiredCertifications }),
        ...(dto.allowedWorkerTypes !== undefined && { allowedWorkerTypes: dto.allowedWorkerTypes }),
        ...(dto.defaultMinTrustScore !== undefined && { defaultMinTrustScore: dto.defaultMinTrustScore }),
        ...(dto.isProfessional !== undefined && { isProfessional: dto.isProfessional }),
        ...(dto.requiresLicence !== undefined && { requiresLicence: dto.requiresLicence }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { domain: { select: { name: true } } },
    })
  }

  async deactivateCategory(id: string) {
    return this.updateCategory(id, { isActive: false })
  }

  // ── Institution — manage their catalog subset ─────────────────────────────

  async getInstitutionCatalog(institutionId: string) {
    // All active categories with institution-level overrides applied
    const [categories, overrides] = await Promise.all([
      this.prisma.platformCatalogCategory.findMany({
        where: { isActive: true },
        include: { domain: { select: { name: true, icon: true } } },
        orderBy: [{ domain: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      }),
      this.prisma.institutionCatalogOverride.findMany({
        where: { institutionId },
      }),
    ])

    const overrideMap = new Map(overrides.map(o => [o.categoryId, o]))

    return categories.map(cat => {
      const override = overrideMap.get(cat.id)
      return {
        ...cat,
        isEnabledForInstitution: override ? override.isEnabled : true, // enabled by default
        institutionMinTrustScore: override?.minTrustScore ?? cat.defaultMinTrustScore,
        customLabel: override?.customLabel ?? null,
        hasOverride: !!override,
      }
    })
  }

  async setInstitutionCategoryOverride(
    institutionId: string,
    categoryId: string,
    override: { isEnabled?: boolean; minTrustScore?: number; customLabel?: string },
  ) {
    return this.prisma.institutionCatalogOverride.upsert({
      where: { institutionId_categoryId: { institutionId, categoryId } },
      create: { institutionId, categoryId, ...override },
      update: override,
    })
  }

  async getCatalogStats() {
    const [domains, categories, professional, artisan] = await Promise.all([
      this.prisma.platformCatalogDomain.count({ where: { isActive: true } }),
      this.prisma.platformCatalogCategory.count({ where: { isActive: true } }),
      this.prisma.platformCatalogCategory.count({ where: { isActive: true, isProfessional: true } }),
      this.prisma.platformCatalogCategory.count({ where: { isActive: true, isProfessional: false } }),
    ])
    return { domains, categories, professional, artisan }
  }
}
