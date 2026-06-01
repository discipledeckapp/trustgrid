import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustScoreService } from '../trust-score/trust-score.service';

export interface CreateIncidentDto {
  workerId?: string;
  vendorId?: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incidentDate: Date;
  locationAddress?: string;
}

export interface ResolveIncidentDto {
  outcome: 'WORKER_EXONERATED' | 'WORKER_PENALIZED' | 'VENDOR_PENALIZED' | 'INCONCLUSIVE';
  summary: string;
  trustScoreImpact?: number;
}

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScoreService: TrustScoreService,
  ) {}

  async create(dto: CreateIncidentDto, institutionId: string, reportedById: string) {
    if (!dto.workerId && !dto.vendorId) {
      throw new BadRequestException('An incident must reference a worker or vendor');
    }

    if (dto.workerId) {
      const worker = await this.prisma.workerProfile.findFirst({
        where: { id: dto.workerId, institutionId },
      });
      if (!worker) throw new NotFoundException('Worker not found');
    }

    if (dto.vendorId) {
      const vendor = await this.prisma.vendorProfile.findFirst({
        where: { id: dto.vendorId, institutionId },
      });
      if (!vendor) throw new NotFoundException('Vendor not found');
    }

    const incident = await this.prisma.incidentReport.create({
      data: {
        institutionId,
        reportedById,
        workerId: dto.workerId,
        vendorId: dto.vendorId,
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        status: 'OPEN',
        incidentDate: dto.incidentDate,
        locationAddress: dto.locationAddress,
      },
    });

    // Immediately emit incident trust event
    if (dto.workerId) {
      await this.trustScoreService.emitEvent({
        type: 'INCIDENT_RAISED',
        workerId: dto.workerId,
        institutionId,
        referenceType: 'incident',
        referenceId: incident.id,
        createdBy: reportedById,
        metadata: { severity: dto.severity },
      });
    }

    return incident;
  }

  async list(institutionId: string, status?: string, page = 1, limit = 20) {
    const where: any = { institutionId };
    if (status) where.status = status;

    const [incidents, total] = await Promise.all([
      this.prisma.incidentReport.findMany({
        where,
        include: {
          worker: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.incidentReport.count({ where }),
    ]);

    return {
      data: incidents,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, institutionId: string) {
    const incident = await this.prisma.incidentReport.findFirst({
      where: { id, institutionId },
      include: {
        worker: {
          include: { user: { select: { firstName: true, lastName: true, phone: true } } },
        },
        notes: { orderBy: { createdAt: 'asc' } },
        resolution: true,
      },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async resolve(id: string, institutionId: string, dto: ResolveIncidentDto, resolvedById: string) {
    const incident = await this.getById(id, institutionId);

    if (['RESOLVED', 'DISMISSED'].includes(incident.status)) {
      throw new BadRequestException('Incident is already resolved');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.incidentReport.update({
        where: { id },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      });

      await tx.incidentResolution.create({
        data: {
          incidentId: id,
          resolvedById,
          outcome: dto.outcome,
          summary: dto.summary,
          trustScoreImpact: dto.trustScoreImpact,
        },
      });
    });

    // Emit resolution trust event
    if (incident.workerId) {
      const eventType =
        dto.outcome === 'WORKER_EXONERATED' ? 'INCIDENT_RESOLVED' :
        dto.outcome === 'WORKER_PENALIZED' ? 'INCIDENT_RESOLVED' :
        'INCIDENT_DISMISSED';

      await this.trustScoreService.emitEvent({
        type: eventType,
        workerId: incident.workerId,
        institutionId,
        referenceType: 'incident',
        referenceId: id,
        createdBy: resolvedById,
        metadata: { outcome: dto.outcome },
      });
    }

    return this.getById(id, institutionId);
  }

  async addNote(id: string, institutionId: string, content: string, authorId: string, isInternal: boolean) {
    const incident = await this.prisma.incidentReport.findFirst({
      where: { id, institutionId },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.incidentNote.create({
      data: { incidentId: id, authorId, content, isInternal },
    });
  }
}
