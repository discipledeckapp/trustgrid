import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface CreateVendorDto {
  companyName: string
  rcNumber?: string
  email?: string
  phone: string
  address?: string
  serviceCategories: string[]
}

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVendorDto, institutionId: string) {
    const existing = await this.prisma.vendorProfile.findFirst({
      where: { phone: dto.phone, institutionId },
    })
    if (existing) throw new ConflictException('A vendor with this phone already exists')

    return this.prisma.vendorProfile.create({
      data: { ...dto, institutionId },
    })
  }

  async list(institutionId: string, params: {
    search?: string
    categoryId?: string
    isPreferred?: boolean
    page?: number
    limit?: number
  } = {}) {
    const page  = Number(params.page)  || 1
    const limit = Number(params.limit) || 20
    const { search, categoryId, isPreferred } = params
    const where: any = { institutionId, isActive: true, isBlacklisted: false }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId) where.serviceCategories = { has: categoryId }
    if (isPreferred) where.isPreferred = true

    const [vendors, total] = await Promise.all([
      this.prisma.vendorProfile.findMany({
        where,
        orderBy: [{ isPreferred: 'desc' }, { trustScore: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vendorProfile.count({ where }),
    ])

    return { data: vendors, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getById(id: string, institutionId: string) {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: { id, institutionId },
      include: {
        procurements: { orderBy: { createdAt: 'desc' }, take: 10 },
        performanceReviews: { orderBy: { createdAt: 'desc' }, take: 5 },
        incidents: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    if (!vendor) throw new NotFoundException('Vendor not found')
    return vendor
  }

  async setPreferred(id: string, institutionId: string, isPreferred: boolean) {
    const vendor = await this.prisma.vendorProfile.findFirst({ where: { id, institutionId } })
    if (!vendor) throw new NotFoundException('Vendor not found')
    return this.prisma.vendorProfile.update({ where: { id }, data: { isPreferred } })
  }

  async blacklist(id: string, institutionId: string, reason: string) {
    const vendor = await this.prisma.vendorProfile.findFirst({ where: { id, institutionId } })
    if (!vendor) throw new NotFoundException('Vendor not found')
    return this.prisma.vendorProfile.update({
      where: { id },
      data: { isBlacklisted: true, blacklistReason: reason, isPreferred: false },
    })
  }
}
