/**
 * AuthorityService — Authority Engine
 *
 * TrustGrid never relies on self-declared authority.
 * Authority must be assigned and verifiable.
 *
 * Key principles:
 * - Authority roles define what a person CAN do
 * - Assignments are given by someone with higher authority
 * - Assignments can expire, be revoked, or be delegated
 * - Every endorsement traces back to an authority assignment
 * - An endorsement is only as valuable as the authority behind it
 */

import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface CreateRoleDto {
  name: string
  description?: string
  level?: number
  canEndorseMemberships?: boolean
  canIssueTrustCredentials?: boolean
  canVerifyChildNodes?: boolean
  canPublishOpportunities?: boolean
  canApproveApplications?: boolean
  canAssignRoles?: boolean
  canBlacklist?: boolean
}

export interface AssignRoleDto {
  userId: string
  roleId: string
  nodeId: string
  expiresAt?: Date
  notes?: string
}

@Injectable()
export class AuthorityService {
  private readonly logger = new Logger(AuthorityService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ── Authority Roles ───────────────────────────────────────────────────────

  async createRole(dto: CreateRoleDto, institutionId: string) {
    return this.prisma.authorityRole.create({
      data: {
        institutionId,
        name: dto.name,
        description: dto.description,
        level: dto.level ?? 0,
        canEndorseMemberships:    dto.canEndorseMemberships ?? false,
        canIssueTrustCredentials: dto.canIssueTrustCredentials ?? false,
        canVerifyChildNodes:      dto.canVerifyChildNodes ?? false,
        canPublishOpportunities:  dto.canPublishOpportunities ?? true,
        canApproveApplications:   dto.canApproveApplications ?? false,
        canAssignRoles:           dto.canAssignRoles ?? false,
        canBlacklist:             dto.canBlacklist ?? false,
      },
    })
  }

  async getRoles(institutionId: string) {
    return this.prisma.authorityRole.findMany({
      where: { institutionId, isActive: true },
      orderBy: { level: 'desc' },
    })
  }

  // ── Seed default RCCG authority roles ─────────────────────────────────────

  async seedRCCGRoles(institutionId: string) {
    const roles = [
      {
        name: 'Provincial Pastor',
        description: 'Head of an RCCG Province. Highest local authority.',
        level: 7,
        canEndorseMemberships: true, canIssueTrustCredentials: true,
        canVerifyChildNodes: true, canApproveApplications: true,
        canAssignRoles: true, canBlacklist: true, canPublishOpportunities: true,
      },
      {
        name: 'Area Pastor',
        description: 'Oversees multiple Parishes within an Area.',
        level: 6,
        canEndorseMemberships: true, canIssueTrustCredentials: true,
        canVerifyChildNodes: true, canApproveApplications: true,
        canAssignRoles: true, canBlacklist: false, canPublishOpportunities: true,
      },
      {
        name: 'Parish Pastor',
        description: 'Head of a local Parish. Issues Parish-level endorsements.',
        level: 5,
        canEndorseMemberships: true, canIssueTrustCredentials: true,
        canVerifyChildNodes: false, canApproveApplications: true,
        canAssignRoles: false, canBlacklist: false, canPublishOpportunities: true,
      },
      {
        name: 'Parish HOD',
        description: 'Head of Department within a Parish (e.g. Electrical, Security).',
        level: 4,
        canEndorseMemberships: true, canIssueTrustCredentials: false,
        canVerifyChildNodes: false, canApproveApplications: true,
        canAssignRoles: false, canBlacklist: false, canPublishOpportunities: true,
      },
      {
        name: 'Welfare Officer',
        description: 'Manages welfare and volunteer coordination.',
        level: 3,
        canEndorseMemberships: false, canIssueTrustCredentials: false,
        canVerifyChildNodes: false, canApproveApplications: false,
        canAssignRoles: false, canBlacklist: false, canPublishOpportunities: true,
      },
      {
        name: 'Parish Member',
        description: 'Verified member of the Parish. Can endorse peers.',
        level: 1,
        canEndorseMemberships: false, canIssueTrustCredentials: false,
        canVerifyChildNodes: false, canApproveApplications: false,
        canAssignRoles: false, canBlacklist: false, canPublishOpportunities: false,
      },
    ]

    const created = []
    for (const role of roles) {
      const existing = await this.prisma.authorityRole.findFirst({
        where: { institutionId, name: role.name },
      })
      if (!existing) {
        created.push(await this.prisma.authorityRole.create({ data: { ...role, institutionId } }))
      }
    }

    return { seeded: created.length, roles: created.map(r => r.name) }
  }

  // ── Authority Assignments ─────────────────────────────────────────────────

  async assignRole(dto: AssignRoleDto, institutionId: string, grantedById: string) {
    const [role, node] = await Promise.all([
      this.prisma.authorityRole.findFirst({ where: { id: dto.roleId, institutionId } }),
      this.prisma.communityNode.findFirst({ where: { id: dto.nodeId, institutionId } }),
    ])

    if (!role) throw new NotFoundException('Authority role not found')
    if (!node) throw new NotFoundException('Community node not found')

    // Check grantor has permission to assign roles
    const grantorAssignment = await this.prisma.authorityAssignment.findFirst({
      where: {
        userId: grantedById,
        institutionId,
        status: 'ACTIVE',
        role: { canAssignRoles: true },
      },
      include: { role: true },
    })

    // Allow INSTITUTION_ADMIN to always assign roles
    const grantor = await this.prisma.userAccount.findFirst({
      where: { id: grantedById },
      select: { role: true },
    })

    if (!grantorAssignment && !['INSTITUTION_ADMIN', 'PLATFORM_ADMIN'].includes(grantor?.role ?? '')) {
      throw new ForbiddenException('You do not have authority to assign roles')
    }

    // Deactivate any existing active assignment for same user/role/node
    await this.prisma.authorityAssignment.updateMany({
      where: { userId: dto.userId, nodeId: dto.nodeId, roleId: dto.roleId, status: 'ACTIVE' },
      data: { status: 'REVOKED', revokedAt: new Date(), revokedById: grantedById, revokedReason: 'Superseded by new assignment' },
    })

    const assignment = await this.prisma.authorityAssignment.create({
      data: {
        userId: dto.userId,
        roleId: dto.roleId,
        nodeId: dto.nodeId,
        institutionId,
        grantedById,
        expiresAt: dto.expiresAt,
        notes: dto.notes,
        status: 'ACTIVE',
      },
      include: {
        role: true,
        node: { select: { id: true, name: true } },
      },
    })

    this.logger.log({
      userId: dto.userId,
      role: role.name,
      node: node.name,
      grantedBy: grantedById,
    }, 'authority_role_assigned')

    return assignment
  }

  async revokeRole(assignmentId: string, institutionId: string, revokedById: string, reason: string) {
    const assignment = await this.prisma.authorityAssignment.findFirst({
      where: { id: assignmentId, institutionId },
    })
    if (!assignment) throw new NotFoundException('Assignment not found')

    return this.prisma.authorityAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedById,
        revokedReason: reason,
      },
    })
  }

  async getAssignmentsForNode(nodeId: string, institutionId: string) {
    return this.prisma.authorityAssignment.findMany({
      where: { nodeId, institutionId, status: 'ACTIVE' },
      include: { role: true },
      orderBy: { role: { level: 'desc' } },
    })
  }

  async getAssignmentsForUser(userId: string, institutionId: string) {
    return this.prisma.authorityAssignment.findMany({
      where: { userId, institutionId, status: 'ACTIVE' },
      include: {
        role: true,
        node: { select: { id: true, name: true, type: { select: { name: true } } } },
      },
      orderBy: { grantedAt: 'desc' },
    })
  }

  async getUserPermissions(userId: string, institutionId: string) {
    const assignments = await this.prisma.authorityAssignment.findMany({
      where: { userId, institutionId, status: 'ACTIVE' },
      include: { role: true, node: { select: { id: true, name: true, depth: true } } },
    })

    // Aggregate all permissions across all active assignments
    return {
      canEndorseMemberships:    assignments.some(a => a.role.canEndorseMemberships),
      canIssueTrustCredentials: assignments.some(a => a.role.canIssueTrustCredentials),
      canVerifyChildNodes:      assignments.some(a => a.role.canVerifyChildNodes),
      canPublishOpportunities:  assignments.some(a => a.role.canPublishOpportunities),
      canApproveApplications:   assignments.some(a => a.role.canApproveApplications),
      canAssignRoles:           assignments.some(a => a.role.canAssignRoles),
      canBlacklist:             assignments.some(a => a.role.canBlacklist),
      assignments: assignments.map(a => ({
        roleId:   a.roleId,
        roleName: a.role.name,
        nodeId:   a.nodeId,
        nodeName: a.node.name,
        level:    a.role.level,
        expiresAt: a.expiresAt,
      })),
    }
  }
}
