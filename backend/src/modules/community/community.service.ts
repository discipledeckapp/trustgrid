/**
 * CommunityService — Community Hierarchy Engine
 *
 * Manages the hierarchical community node structure.
 * Every trust action in TrustGrid flows through Community Nodes.
 *
 * Key operations:
 * - Create/manage community node types (Province, Area, Parish, etc.)
 * - Create/manage community nodes with parent-child relationships
 * - Verify community nodes (Area verifies Parishes)
 * - Manage memberships (who belongs to which node)
 * - Propagate trust signals up and down the hierarchy
 */

import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface CreateNodeTypeDto {
  name: string
  pluralName?: string
  level: number
  icon?: string
  color?: string
  canVerifyChildren?: boolean
  canIssueCredentials?: boolean
  canPublishOpportunities?: boolean
}

export interface CreateNodeDto {
  typeId: string
  name: string
  parentId?: string
  description?: string
  externalCode?: string
  address?: string
  city?: string
  state?: string
}

export interface CreateMembershipDto {
  userId: string
  nodeId: string
  type?: string
}

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ── Node Types ────────────────────────────────────────────────────────────

  async createNodeType(dto: CreateNodeTypeDto, institutionId: string) {
    const existing = await this.prisma.communityNodeType.findFirst({
      where: { institutionId, level: dto.level, isActive: true },
    })
    if (existing) {
      throw new ConflictException(`A node type already exists at level ${dto.level}: "${existing.name}"`)
    }

    return this.prisma.communityNodeType.create({
      data: {
        institutionId,
        name: dto.name,
        pluralName: dto.pluralName,
        level: dto.level,
        icon: dto.icon,
        color: dto.color,
        canVerifyChildren:        dto.canVerifyChildren ?? true,
        canIssueCredentials:      dto.canIssueCredentials ?? true,
        canPublishOpportunities:  dto.canPublishOpportunities ?? true,
      },
    })
  }

  async getNodeTypes(institutionId: string) {
    return this.prisma.communityNodeType.findMany({
      where: { institutionId, isActive: true },
      orderBy: { level: 'asc' },
    })
  }

  // ── Community Nodes ───────────────────────────────────────────────────────

  async createNode(dto: CreateNodeDto, institutionId: string, createdBy: string) {
    const nodeType = await this.prisma.communityNodeType.findFirst({
      where: { id: dto.typeId, institutionId },
    })
    if (!nodeType) throw new NotFoundException('Node type not found')

    let depth = 0
    if (dto.parentId) {
      const parent = await this.prisma.communityNode.findFirst({
        where: { id: dto.parentId, institutionId },
      })
      if (!parent) throw new NotFoundException('Parent node not found')
      depth = parent.depth + 1
    }

    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim()
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`

    return this.prisma.communityNode.create({
      data: {
        institutionId,
        typeId: dto.typeId,
        name: dto.name,
        slug: uniqueSlug,
        description: dto.description,
        externalCode: dto.externalCode,
        parentId: dto.parentId,
        depth,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        createdBy,
        status: dto.parentId ? 'PENDING_VERIFICATION' : 'ACTIVE',
      },
      include: { type: true, parent: { select: { id: true, name: true } } },
    })
  }

  async getNode(nodeId: string, institutionId: string) {
    const node = await this.prisma.communityNode.findFirst({
      where: { id: nodeId, institutionId },
      include: {
        type: true,
        parent: { select: { id: true, name: true, type: { select: { name: true } } } },
        children: {
          include: { type: true },
          orderBy: { name: 'asc' },
        },
        verifyingNode: { select: { id: true, name: true } },
        _count: { select: { memberships: true, authorityAssignments: true, opportunities: true } },
      },
    })
    if (!node) throw new NotFoundException('Community node not found')
    return node
  }

  async getHierarchy(institutionId: string, rootId?: string) {
    const nodes = await this.prisma.communityNode.findMany({
      where: {
        institutionId,
        ...(rootId ? { id: rootId } : { parentId: null }),
      },
      include: {
        type: true,
        children: {
          include: {
            type: true,
            children: {
              include: {
                type: true,
                _count: { select: { memberships: true } },
              },
            },
            _count: { select: { memberships: true } },
          },
        },
        _count: { select: { memberships: true } },
      },
      orderBy: { name: 'asc' },
    })
    return nodes
  }

  async getAncestors(nodeId: string, institutionId: string) {
    const ancestors: any[] = []
    let current = await this.prisma.communityNode.findFirst({
      where: { id: nodeId, institutionId },
      include: { type: { select: { name: true } } },
    })
    while (current?.parentId) {
      current = await this.prisma.communityNode.findFirst({
        where: { id: current.parentId },
        include: { type: { select: { name: true } } },
      })
      if (current) ancestors.unshift(current)
    }
    return ancestors
  }

  async verifyNode(nodeId: string, institutionId: string, verifiedById: string, verifyingNodeId: string) {
    const [node, verifyingNode] = await Promise.all([
      this.prisma.communityNode.findFirst({ where: { id: nodeId, institutionId } }),
      this.prisma.communityNode.findFirst({ where: { id: verifyingNodeId, institutionId } }),
    ])

    if (!node) throw new NotFoundException('Node not found')
    if (!verifyingNode) throw new NotFoundException('Verifying node not found')
    if (verifyingNode.depth >= node.depth) {
      throw new BadRequestException('A node can only be verified by a node higher in the hierarchy')
    }

    return this.prisma.communityNode.update({
      where: { id: nodeId },
      data: {
        status: 'ACTIVE',
        verifiedById: verifyingNodeId,
        verifiedAt: new Date(),
      },
    })
  }

  // ── Memberships ───────────────────────────────────────────────────────────

  async addMembership(dto: CreateMembershipDto, institutionId: string, grantedById?: string) {
    const node = await this.prisma.communityNode.findFirst({
      where: { id: dto.nodeId, institutionId },
    })
    if (!node) throw new NotFoundException('Community node not found')

    const existing = await this.prisma.membership.findUnique({
      where: { nodeId_userId: { nodeId: dto.nodeId, userId: dto.userId } },
    })
    if (existing) {
      if (existing.status === 'ACTIVE') throw new ConflictException('Already a member')
      // Reactivate if previously revoked
      return this.prisma.membership.update({
        where: { id: existing.id },
        data: { status: 'PENDING', verifiedById: null, verifiedAt: null },
      })
    }

    const membership = await this.prisma.membership.create({
      data: {
        nodeId: dto.nodeId,
        userId: dto.userId,
        institutionId,
        type: (dto.type as any) ?? 'RESIDENT',
        status: grantedById ? 'ACTIVE' : 'PENDING',
        verificationLevel: grantedById ? 'AUTHORITY_ISSUED' : 'SELF_DECLARED',
        verifiedById: grantedById,
        verifiedAt: grantedById ? new Date() : null,
      },
    })

    // Update member count
    await this.prisma.communityNode.update({
      where: { id: dto.nodeId },
      data: { memberCount: { increment: 1 } },
    })

    return membership
  }

  async approveMembership(membershipId: string, institutionId: string, approvedById: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, institutionId },
    })
    if (!membership) throw new NotFoundException('Membership not found')

    return this.prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: 'ACTIVE',
        verifiedById: approvedById,
        verifiedAt: new Date(),
        verificationLevel: 'AUTHORITY_ISSUED',
      },
    })
  }

  async getMembers(nodeId: string, institutionId: string, status?: string) {
    return this.prisma.membership.findMany({
      where: {
        nodeId,
        institutionId,
        ...(status && { status: status as any }),
      },
      orderBy: { joinedAt: 'desc' },
    })
  }

  // ── Seed default RCCG hierarchy types for RCCG institutions ───────────────

  async seedRCCGNodeTypes(institutionId: string, createdBy: string) {
    const types = [
      { name: 'Global', pluralName: 'Global',         level: 1, icon: 'globe',    color: '#4F46E5' },
      { name: 'Continent', pluralName: 'Continents',  level: 2, icon: 'map',      color: '#0D9488' },
      { name: 'Region', pluralName: 'Regions',        level: 3, icon: 'layers',   color: '#059669' },
      { name: 'Province', pluralName: 'Provinces',    level: 4, icon: 'building', color: '#D97706' },
      { name: 'Zone', pluralName: 'Zones',            level: 5, icon: 'grid',     color: '#7C3AED' },
      { name: 'Area', pluralName: 'Areas',            level: 6, icon: 'map-pin',  color: '#DC2626' },
      { name: 'Parish', pluralName: 'Parishes',       level: 7, icon: 'church',   color: '#1D4ED8' },
    ]

    const created = []
    for (const t of types) {
      const existing = await this.prisma.communityNodeType.findFirst({
        where: { institutionId, level: t.level },
      })
      if (!existing) {
        const type = await this.prisma.communityNodeType.create({
          data: { ...t, institutionId },
        })
        created.push(type)
      }
    }
    return { seeded: created.length, message: `Seeded ${created.length} RCCG hierarchy levels` }
  }

  async seedEstateNodeTypes(institutionId: string) {
    const types = [
      { name: 'Estate',  pluralName: 'Estates',  level: 1, icon: 'home',      color: '#4F46E5' },
      { name: 'Phase',   pluralName: 'Phases',   level: 2, icon: 'layers',    color: '#0D9488' },
      { name: 'Street',  pluralName: 'Streets',  level: 3, icon: 'road',      color: '#059669' },
      { name: 'Block',   pluralName: 'Blocks',   level: 4, icon: 'square',    color: '#D97706' },
    ]
    const created = []
    for (const t of types) {
      const existing = await this.prisma.communityNodeType.findFirst({
        where: { institutionId, level: t.level },
      })
      if (!existing) {
        created.push(await this.prisma.communityNodeType.create({ data: { ...t, institutionId } }))
      }
    }
    return { seeded: created.length }
  }
}
