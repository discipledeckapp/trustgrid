import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { QUEUES, NOTIFICATION_JOBS, TRUST_SCORE_JOBS } from '../queues/queue.constants'

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUES.TRUST_SCORE)   private readonly trustScoreQueue: Queue,
  ) {}

  async getMyAssignments(userId: string, institutionId: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { userId, institutionId },
    })
    if (!worker) return []   // admin/operator users have no worker profile

    const assignments = await this.prisma.assignmentWorker.findMany({
      where: { workerId: worker.id },
      include: {
        assignment: {
          include: {
            serviceRequest: {
              select: {
                title: true, description: true, categoryId: true,
                locationAddress: true, scheduledStartAt: true,
                scheduledEndAt: true, estimatedHours: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return assignments.map((aw) => ({
      id: aw.id,
      assignmentId: aw.assignmentId,
      role: aw.role,
      status: aw.status,
      acceptedAt: aw.acceptedAt,
      startedAt: aw.startedAt,
      completedAt: aw.completedAt,
      assignment: {
        id: aw.assignment.id,
        title: aw.assignment.title,
        status: aw.assignment.status,
        serviceRequest: aw.assignment.serviceRequest,
      },
    }))
  }

  async acceptAssignment(assignmentWorkerId: string, userId: string, institutionId: string) {
    const aw = await this.findAssignmentWorker(assignmentWorkerId, userId, institutionId)

    if (aw.status !== 'PENDING_ACCEPTANCE') {
      throw new BadRequestException(`Cannot accept — current status: ${aw.status}`)
    }

    const updated = await this.prisma.assignmentWorker.update({
      where: { id: assignmentWorkerId },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    // Check if ALL workers have accepted — if so, mark assignment ACTIVE
    await this.checkAndActivateAssignment(aw.assignmentId)

    return updated
  }

  async declineAssignment(assignmentWorkerId: string, userId: string, institutionId: string, reason?: string) {
    const aw = await this.findAssignmentWorker(assignmentWorkerId, userId, institutionId)

    if (!['PENDING_ACCEPTANCE', 'ACCEPTED'].includes(aw.status)) {
      throw new BadRequestException(`Cannot decline — current status: ${aw.status}`)
    }

    return this.prisma.assignmentWorker.update({
      where: { id: assignmentWorkerId },
      data: { status: 'DECLINED', declinedAt: new Date(), declineReason: reason },
    })
  }

  async checkIn(assignmentWorkerId: string, userId: string, institutionId: string) {
    const aw = await this.findAssignmentWorker(assignmentWorkerId, userId, institutionId)

    if (aw.status !== 'ACCEPTED') {
      throw new BadRequestException('Must accept the assignment before checking in')
    }

    return this.prisma.assignmentWorker.update({
      where: { id: assignmentWorkerId },
      data: { status: 'ACTIVE', startedAt: new Date(), checkInAt: new Date() },
    })
  }

  async checkOut(assignmentWorkerId: string, userId: string, institutionId: string) {
    const aw = await this.findAssignmentWorker(assignmentWorkerId, userId, institutionId)

    if (aw.status !== 'ACTIVE') {
      throw new BadRequestException('Must be checked in before checking out')
    }

    const updated = await this.prisma.assignmentWorker.update({
      where: { id: assignmentWorkerId },
      data: { status: 'COMPLETED', completedAt: new Date(), checkOutAt: new Date() },
    })

    // Queue trust score update for deployment completed
    await this.trustScoreQueue.add(TRUST_SCORE_JOBS.EMIT_EVENT, {
      type: 'DEPLOYMENT_COMPLETED',
      workerId: aw.workerId,
      institutionId,
      referenceType: 'assignment_worker',
      referenceId: assignmentWorkerId,
    })

    // Update worker deployment stats
    await this.prisma.workerProfile.update({
      where: { id: aw.workerId },
      data: {
        totalDeployments: { increment: 1 },
        completedDeployments: { increment: 1 },
        lastActiveAt: new Date(),
      },
    })

    return updated
  }

  async getAssignmentDetail(assignmentId: string, institutionId: string) {
    const assignment = await this.prisma.workforceAssignment.findFirst({
      where: { id: assignmentId, institutionId },
      include: {
        serviceRequest: true,
        assignmentWorkers: {
          include: {
            worker: {
              include: { user: { select: { firstName: true, lastName: true, phone: true } } },
            },
          },
        },
      },
    })

    if (!assignment) throw new NotFoundException('Assignment not found')
    return assignment
  }

  private async findAssignmentWorker(id: string, userId: string, institutionId: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { userId, institutionId },
    })
    if (!worker) throw new NotFoundException('Worker profile not found')

    const aw = await this.prisma.assignmentWorker.findFirst({
      where: { id, workerId: worker.id },
    })
    if (!aw) throw new ForbiddenException('Assignment not found or not assigned to you')

    return { ...aw, workerId: worker.id }
  }

  private async checkAndActivateAssignment(assignmentId: string) {
    const workers = await this.prisma.assignmentWorker.findMany({
      where: { assignmentId },
    })

    const allAccepted = workers.every((w) => w.status === 'ACCEPTED')
    if (allAccepted) {
      await this.prisma.workforceAssignment.update({
        where: { id: assignmentId },
        data: { status: 'ACTIVE', startedAt: new Date() },
      })
      await this.prisma.serviceRequest.updateMany({
        where: { assignment: { id: assignmentId } },
        data: { status: 'IN_PROGRESS' },
      })
    }
  }
}
