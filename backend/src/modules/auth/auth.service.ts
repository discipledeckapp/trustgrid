import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { institution: instDto, admin: adminDto } = dto;

    const existing = await this.prisma.institution.findUnique({
      where: { email: instDto.email },
    });
    if (existing) {
      throw new ConflictException('Institution with this email already exists');
    }

    const slug = this.generateSlug(instDto.name);

    const passwordHash = await bcrypt.hash(adminDto.password, 12);

    const institution = await this.prisma.institution.create({
      data: {
        name: instDto.name,
        slug,
        type: instDto.type,
        email: instDto.email,
        country: instDto.country ?? 'NG',
        config: {
          create: {
            trustScoreWeights: this.defaultTrustScoreWeights(),
            serviceCategories: this.defaultServiceCategories(),
          },
        },
      },
    });

    const user = await this.prisma.userAccount.create({
      data: {
        institutionId: institution.id,
        firstName: adminDto.firstName,
        lastName: adminDto.lastName,
        phone: adminDto.phone,
        email: adminDto.email,
        role: 'INSTITUTION_ADMIN',
        passwordHash,
      },
    });

    const tokens = await this.generateTokens(user.id, institution.id, user.role);

    return {
      institution: { id: institution.id, name: institution.name, slug: institution.slug },
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
      tokens,
    };
  }

  async login(dto: LoginDto, institutionId?: string) {
    const identifier = dto.identifier.trim()
    const isEmail = identifier.includes('@')

    // Build where clause — institutionId is optional.
    // If provided (e.g. from X-Institution-ID header or community middleware),
    // scope the lookup. Otherwise search globally — useful on first login
    // before the client has stored an institutionId.
    const identifierClause = isEmail
      ? { email: identifier.toLowerCase() }
      : { phone: identifier }

    const where = institutionId
      ? { ...identifierClause, institutionId }
      : identifierClause

    const user = await this.prisma.userAccount.findFirst({ where });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    await this.prisma.userAccount.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.institutionId, user.role);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        institutionId: user.institutionId,
        profilePhotoUrl: user.profilePhotoUrl,
      },
      tokens,
    };
  }

  async refreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.userAccount.findUnique({
      where: { id: stored.userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    // Rotate refresh token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(user.id, user.institutionId, user.role);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async generateTokens(userId: string, institutionId: string, role: string) {
    const payload = { sub: userId, institutionId, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY') ?? '15m',
    });

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshTokenValue, expiresAt },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 900,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private defaultTrustScoreWeights() {
    return {
      account_created: 5.0,
      identity_verified: 10.0,
      credential_verified: 5.0,
      deployment_completed: 2.0,
      deployment_abandoned: -3.0,
      rating_5_star: 3.0,
      rating_4_star: 1.5,
      rating_3_star: 0.5,
      rating_2_star: -1.0,
      rating_1_star: -2.5,
      endorsement_added: 1.5,
      endorsement_institutional: 3.0,
      endorsement_removed: -1.5,
      incident_raised: -5.0,
      incident_resolved_exonerated: 3.0,
      incident_resolved_penalized: -2.0,
      incident_dismissed: 1.0,
      inactivity_penalty: -0.5,
      manual_bonus: 1.0,
      manual_penalty: -2.0,
    };
  }

  private defaultServiceCategories() {
    return [
      { id: 'cat_electrical', name: 'Electrical', icon: 'bolt', color: '#F59E0B', defaultMinTrustScore: 60 },
      { id: 'cat_plumbing', name: 'Plumbing', icon: 'droplets', color: '#3B82F6', defaultMinTrustScore: 55 },
      { id: 'cat_cleaning', name: 'Cleaning', icon: 'sparkles', color: '#10B981', defaultMinTrustScore: 45 },
      { id: 'cat_security', name: 'Security', icon: 'shield', color: '#6366F1', defaultMinTrustScore: 70 },
      { id: 'cat_transport', name: 'Transport', icon: 'truck', color: '#F97316', defaultMinTrustScore: 60 },
      { id: 'cat_medical', name: 'Medical', icon: 'heart-pulse', color: '#EF4444', defaultMinTrustScore: 75 },
      { id: 'cat_event', name: 'Event Services', icon: 'calendar', color: '#8B5CF6', defaultMinTrustScore: 50 },
      { id: 'cat_general', name: 'General Labour', icon: 'wrench', color: '#6B7280', defaultMinTrustScore: 40 },
    ];
  }
}
