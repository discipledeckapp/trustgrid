import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface CreateVolunteerDto {
  firstName: string
  lastName: string
  phone: string
  email?: string
  skills: string[]
}

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVolunteerDto, institutionId: string) {
    return this.prisma.volunteerProfile.create({
      data: { ...dto, institutionId },
    })
  }

  async list(institutionId: string, params: { skill?: string; isAvailable?: boolean; page?: number; limit?: number } = {}) {
    const page  = Number(params.page)  || 1
    const limit = Number(params.limit) || 20
    const { skill, isAvailable } = params
    const where: any = { institutionId, isActive: true }
    if (skill) where.skills = { has: skill }
    if (isAvailable !== undefined) where.isAvailable = isAvailable

    const [volunteers, total] = await Promise.all([
      this.prisma.volunteerProfile.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.volunteerProfile.count({ where }),
    ])

    return { data: volunteers, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getById(id: string, institutionId: string) {
    const v = await this.prisma.volunteerProfile.findFirst({ where: { id, institutionId } })
    if (!v) throw new NotFoundException('Volunteer not found')
    return v
  }

  async toggleAvailability(id: string, institutionId: string, isAvailable: boolean) {
    const v = await this.prisma.volunteerProfile.findFirst({ where: { id, institutionId } })
    if (!v) throw new NotFoundException('Volunteer not found')
    return this.prisma.volunteerProfile.update({ where: { id }, data: { isAvailable } })
  }

  async mobilise(institutionId: string, skills: string[], limit = 20) {
    return this.prisma.volunteerProfile.findMany({
      where: {
        institutionId, isActive: true, isAvailable: true,
        OR: skills.map(s => ({ skills: { has: s } })),
      },
      take: limit,
    })
  }
}
