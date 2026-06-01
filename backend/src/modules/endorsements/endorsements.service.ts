import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustScoreService } from '../trust-score/trust-score.service';

export interface CreateEndorsementDto {
  endorserName: string;
  endorserRole?: string;
  comment?: string;
}

@Injectable()
export class EndorsementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustScoreService: TrustScoreService,
  ) {}

  async addEndorsement(
    workerId: string,
    institutionId: string,
    dto: CreateEndorsementDto,
    endorsedById: string,
    endorserRole: string,
  ) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const isInstitutionalEndorser = ['INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR'].includes(endorserRole);
    const weight = isInstitutionalEndorser ? 3.0 : 1.5;

    const endorsement = await this.prisma.endorsement.create({
      data: {
        institutionId,
        workerId,
        endorsedById,
        endorserName: dto.endorserName,
        endorserRole: dto.endorserRole,
        comment: dto.comment,
        weight,
      },
    });

    // Update total endorsements count
    await this.prisma.workerProfile.update({
      where: { id: workerId },
      data: { totalEndorsements: { increment: 1 } },
    });

    // Emit trust event
    await this.trustScoreService.emitEvent({
      type: isInstitutionalEndorser ? 'ENDORSEMENT_ADDED' : 'ENDORSEMENT_ADDED',
      workerId,
      institutionId,
      referenceType: 'endorsement',
      referenceId: endorsement.id,
      createdBy: endorsedById,
      metadata: { isInstitutional: isInstitutionalEndorser, weight },
    });

    const updatedWorker = await this.prisma.workerProfile.findUnique({
      where: { id: workerId },
      select: { trustScore: true },
    });

    return {
      ...endorsement,
      newTrustScore: updatedWorker?.trustScore ?? 0,
    };
  }

  async listEndorsements(workerId: string, institutionId: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { id: workerId, institutionId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return this.prisma.endorsement.findMany({
      where: { workerId, institutionId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeEndorsement(endorsementId: string, institutionId: string, revokedBy: string, reason?: string) {
    const endorsement = await this.prisma.endorsement.findFirst({
      where: { id: endorsementId, institutionId, isActive: true },
    });
    if (!endorsement) throw new NotFoundException('Endorsement not found');

    await this.prisma.endorsement.update({
      where: { id: endorsementId },
      data: { isActive: false, revokedAt: new Date(), revokedReason: reason },
    });

    if (endorsement.workerId) {
      await this.prisma.workerProfile.update({
        where: { id: endorsement.workerId },
        data: { totalEndorsements: { decrement: 1 } },
      });

      await this.trustScoreService.emitEvent({
        type: 'ENDORSEMENT_REMOVED',
        workerId: endorsement.workerId,
        institutionId,
        referenceType: 'endorsement',
        referenceId: endorsementId,
        createdBy: revokedBy,
      });
    }
  }
}
