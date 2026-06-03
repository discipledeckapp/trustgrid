import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DemoRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    institutionName: string;
    institutionType?: string;
    name: string;
    role?: string;
    phone: string;
    email?: string;
    message?: string;
  }) {
    return this.prisma.demoRequest.create({
      data: {
        institutionName: data.institutionName,
        institutionType: data.institutionType,
        contactName: data.name,
        contactRole: data.role,
        contactPhone: data.phone,
        contactEmail: data.email,
        message: data.message,
      },
    });
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.demoRequest.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.demoRequest.count(),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: string, notes?: string) {
    return this.prisma.demoRequest.update({
      where: { id },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
    });
  }
}
