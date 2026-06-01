import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ── Create ─────────────────────────────────────────────────────────────────

  async create(dto: {
    institutionId: string
    publishingNodeId: string
    type: string
    title: string
    description: string
    location?: string
    startDate?: Date
    endDate?: Date
    slotsAvailable?: number
    requiresMembership?: boolean
    requiredNodeIds?: string[]
    minimumTrustScore?: number
    requiredCredentials?: string[]
    noOpenIncidents?: boolean
    requiredSkills?: string[]
    categoryIds?: string[]
    createdById: string
  }) {
    const node = await this.prisma.communityNode.findUnique({ where: { id: dto.publishingNodeId } })
    if (!node) throw new NotFoundException('Publishing node not found')
    if (node.institutionId !== dto.institutionId) throw new ForbiddenException('Node belongs to a different institution')

    const opportunity = await this.prisma.opportunity.create({
      data: {
        institutionId:    dto.institutionId,
        publishingNodeId: dto.publishingNodeId,
        type:             dto.type as any,
        title:            dto.title,
        description:      dto.description,
        location:         dto.location,
        startDate:        dto.startDate,
        endDate:          dto.endDate,
        slotsAvailable:   dto.slotsAvailable,
        requiresMembership: dto.requiresMembership ?? true,
        requiredNodeIds:  dto.requiredNodeIds ?? [],
        minimumTrustScore: dto.minimumTrustScore,
        requiredCredentials: dto.requiredCredentials ?? [],
        noOpenIncidents:  dto.noOpenIncidents ?? false,
        requiredSkills:   dto.requiredSkills ?? [],
        categoryIds:      dto.categoryIds ?? [],
        createdById:      dto.createdById,
        status:           'DRAFT',
      },
      include: { publishingNode: { select: { id: true, name: true } } },
    })

    this.logger.log({ opportunityId: opportunity.id, title: dto.title }, 'opportunity_created')
    return opportunity
  }

  async publish(id: string, institutionId: string) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id } })
    if (!opp || opp.institutionId !== institutionId) throw new NotFoundException('Opportunity not found')
    if (opp.status !== 'DRAFT') throw new BadRequestException('Only draft opportunities can be published')
    return this.prisma.opportunity.update({
      where: { id },
      data: { status: 'OPEN', publishedAt: new Date() },
    })
  }

  async close(id: string, institutionId: string) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id } })
    if (!opp || opp.institutionId !== institutionId) throw new NotFoundException('Opportunity not found')
    return this.prisma.opportunity.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    })
  }

  // ── List ──────────────────────────────────────────────────────────────────

  async list(params: { institutionId: string; status?: string; type?: string; page?: number }) {
    const page  = params.page ?? 1
    const limit = 20
    const skip  = (page - 1) * limit

    const where: any = { institutionId: params.institutionId }
    if (params.status) where.status = params.status
    if (params.type)   where.type   = params.type

    const [items, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          publishingNode: { select: { id: true, name: true, type: { select: { name: true } } } },
          _count: { select: { applications: true } },
        },
      }),
      this.prisma.opportunity.count({ where }),
    ])

    return { items, total, page, pages: Math.ceil(total / limit) }
  }

  // ── List opportunities a user qualifies for ───────────────────────────────

  async listForUser(userId: string, institutionId: string) {
    const worker = await this.prisma.workerProfile.findFirst({
      where: { userId, institutionId },
      select: { trustScore: true, id: true },
    })
    const trustScore = worker?.trustScore ?? 0

    const memberships = await this.prisma.membership.findMany({
      where: { userId, institutionId, status: 'ACTIVE' },
      select: { nodeId: true },
    })
    const memberNodeIds = memberships.map(m => m.nodeId)

    const openIncidents = worker
      ? await this.prisma.incidentReport.count({
          where: { workerId: worker.id, institutionId, status: { notIn: ['RESOLVED', 'DISMISSED'] } },
        })
      : 0

    const opportunities = await this.prisma.opportunity.findMany({
      where: { institutionId, status: 'OPEN' },
      include: {
        publishingNode: { select: { id: true, name: true, type: { select: { name: true } } } },
        _count: { select: { applications: true } },
      },
      orderBy: { publishedAt: 'desc' },
    })

    const result = opportunities.map(opp => {
      const reasons: string[] = []

      if (opp.minimumTrustScore && trustScore < opp.minimumTrustScore) {
        reasons.push(`Requires trust score ≥${opp.minimumTrustScore} (yours: ${Math.round(trustScore)})`)
      }
      if (opp.noOpenIncidents && openIncidents > 0) {
        reasons.push('Requires no open incidents')
      }
      if (opp.requiresMembership && opp.requiredNodeIds.length > 0) {
        const hasNode = opp.requiredNodeIds.some(nId => memberNodeIds.includes(nId))
        if (!hasNode) reasons.push('Requires membership in a specified community node')
      }
      const slotsFull = opp.slotsAvailable != null && opp.slotsFilled >= opp.slotsAvailable
      if (slotsFull) reasons.push('All slots filled')

      return { ...opp, eligible: reasons.length === 0, ineligibleReasons: reasons }
    })

    return { opportunities: result, userTrustScore: Math.round(trustScore) }
  }

  async findOne(id: string, institutionId: string) {
    const opp = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        publishingNode: { select: { id: true, name: true, type: { select: { name: true } } } },
        applications: { orderBy: { appliedAt: 'desc' }, take: 100 },
        _count: { select: { applications: true } },
      },
    })
    if (!opp || opp.institutionId !== institutionId) throw new NotFoundException('Opportunity not found')
    return opp
  }

  // ── Apply ──────────────────────────────────────────────────────────────────

  async apply(opportunityId: string, applicantId: string, institutionId: string, message?: string) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id: opportunityId } })
    if (!opp || opp.institutionId !== institutionId) throw new NotFoundException('Opportunity not found')
    if (opp.status !== 'OPEN') throw new BadRequestException('This opportunity is not accepting applications')

    const worker = await this.prisma.workerProfile.findFirst({
      where: { userId: applicantId, institutionId },
      select: { trustScore: true, id: true },
    })
    const trustScore = worker?.trustScore ?? 0

    if (opp.minimumTrustScore && trustScore < opp.minimumTrustScore) {
      throw new ForbiddenException(
        `Your trust score (${Math.round(trustScore)}) is below the minimum required (${opp.minimumTrustScore})`
      )
    }
    if (opp.noOpenIncidents && worker) {
      const openIncidents = await this.prisma.incidentReport.count({
        where: { workerId: worker.id, institutionId, status: { notIn: ['RESOLVED', 'DISMISSED'] } },
      })
      if (openIncidents > 0) throw new ForbiddenException('You have open incidents and cannot apply to this opportunity')
    }
    if (opp.slotsAvailable != null && opp.slotsFilled >= opp.slotsAvailable) {
      throw new BadRequestException('All slots for this opportunity are filled')
    }

    const existing = await this.prisma.opportunityApplication.findUnique({
      where: { opportunityId_applicantId: { opportunityId, applicantId } },
    })
    if (existing) throw new BadRequestException('You have already applied to this opportunity')

    const application = await this.prisma.opportunityApplication.create({
      data: { opportunityId, applicantId, institutionId, message },
    })

    this.logger.log({ opportunityId, applicantId }, 'opportunity_applied')
    return application
  }

  async reviewApplication(applicationId: string, reviewedById: string, institutionId: string, decision: 'ACCEPTED' | 'DECLINED', notes?: string) {
    const app = await this.prisma.opportunityApplication.findUnique({
      where: { id: applicationId },
      include: { opportunity: true },
    })
    if (!app || app.institutionId !== institutionId) throw new NotFoundException('Application not found')
    if (app.status !== 'PENDING') throw new BadRequestException('Application already reviewed')

    const updated = await this.prisma.opportunityApplication.update({
      where: { id: applicationId },
      data: { status: decision, reviewedAt: new Date(), reviewedById, reviewNotes: notes },
    })

    if (decision === 'ACCEPTED') {
      await this.prisma.opportunity.update({
        where: { id: app.opportunityId },
        data: { slotsFilled: { increment: 1 } },
      })
    }

    return updated
  }

  async getMyApplications(userId: string, institutionId: string) {
    return this.prisma.opportunityApplication.findMany({
      where: { applicantId: userId, institutionId },
      include: {
        opportunity: {
          select: {
            id: true, title: true, type: true, location: true,
            startDate: true, endDate: true, status: true,
            publishingNode: { select: { name: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    })
  }
}
