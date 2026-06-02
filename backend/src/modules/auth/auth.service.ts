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
import { ZeptomailService } from '../../common/email/zeptomail.service';
import { TermiiService } from '../../common/notifications/termii.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly email: ZeptomailService,
    private readonly termii: TermiiService,
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

  async forgotPassword(identifier: string) {
    const isEmail = identifier.includes('@')
    const user = await this.prisma.userAccount.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { phone: identifier },
      include: { institution: { select: { name: true } } },
    })

    // Always return success to prevent user enumeration
    if (!user) {
      return { success: true, message: 'If that account exists, a reset code has been sent.' }
    }

    // Invalidate any existing OTPs
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, otp, expiresAt },
    })

    const communityName = (user as any).institution?.name ?? 'TrustGrid'
    const message = `Your TrustGrid password reset code is: ${otp}. Valid for 10 minutes. Do not share this code.`

    // Send via email if available
    if (isEmail && user.email) {
      await this.email.sendEmail({
        to: user.email,
        toName: user.firstName,
        subject: 'TrustGrid — Password Reset Code',
        htmlBody: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#4F46E5,#0D9488);padding:28px 36px;border-radius:16px 16px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:900;">Password Reset</h1>
              <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">${communityName}</p>
            </div>
            <div style="padding:28px 36px;background:#fff;">
              <p style="color:#1e293b;font-size:15px;">Hi <strong>${user.firstName}</strong>,</p>
              <p style="color:#64748b;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
              <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
                <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Reset Code</p>
                <p style="margin:0;font-size:36px;font-weight:900;font-family:monospace;color:#1e293b;letter-spacing:0.15em;">${otp}</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;">If you did not request this, ignore this email. Your password will not change.</p>
            </div>
            <div style="padding:16px 36px;background:#f8fafc;border-radius:0 0 16px 16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#cbd5e1;">Powered by TrustGrid · trustgrid.ng</p>
            </div>
          </div>
        `,
        textBody: message,
      }).catch(() => {})
    }

    // Send via SMS if phone
    if (!isEmail && user.phone) {
      await this.termii.sendSMS(user.phone, message).catch(() => {})
    }

    return { success: true, message: 'If that account exists, a reset code has been sent.' }
  }

  async resetPassword(identifier: string, otp: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters')
    }

    const isEmail = identifier.includes('@')
    const user = await this.prisma.userAccount.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { phone: identifier },
    })

    if (!user) throw new UnauthorizedException('Invalid or expired reset code')

    const token = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        otp,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (!token) throw new UnauthorizedException('Invalid or expired reset code')

    // Mark token used and update password atomically
    const newHash = await bcrypt.hash(newPassword, 12)
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.userAccount.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }),
    ])

    return { success: true, message: 'Password updated successfully. You can now sign in.' }
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
