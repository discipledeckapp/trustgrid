import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { PrismaService } from '../../prisma/prisma.service'
import { AuthService } from './auth.service'

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name)
  private readonly client: OAuth2Client

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {
    this.client = new OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'))
  }

  isConfigured(): boolean {
    return !!this.config.get('GOOGLE_CLIENT_ID')
  }

  async loginWithGoogle(credential: string) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')
    if (!clientId) {
      throw new UnauthorizedException('Google sign-in is not configured on this server.')
    }

    // Verify the Google ID token
    let payload: any
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      })
      payload = ticket.getPayload()
    } catch (err) {
      this.logger.warn({ err }, 'google_token_verification_failed')
      throw new UnauthorizedException('Invalid Google credential. Please try again.')
    }

    const { email, given_name, family_name, picture, sub: googleId } = payload

    if (!email) {
      throw new UnauthorizedException('Google account has no email address.')
    }

    // Find existing user by email (across all institutions)
    let user = await this.prisma.userAccount.findFirst({
      where: { email: email.toLowerCase() },
    })

    if (user) {
      // Existing user — log them in
      if (!user.isActive) {
        throw new UnauthorizedException('This account has been suspended.')
      }

      await this.prisma.userAccount.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), profilePhotoUrl: user.profilePhotoUrl ?? picture },
      })

      const tokens = await (this.authService as any).generateTokens(user.id, user.institutionId, user.role)

      return {
        isNewUser: false,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          institutionId: user.institutionId,
          profilePhotoUrl: user.profilePhotoUrl ?? picture,
        },
        tokens,
      }
    }

    // New user — needs to create/join an institution
    return {
      isNewUser: true,
      googleProfile: {
        email: email.toLowerCase(),
        firstName: given_name ?? '',
        lastName:  family_name ?? '',
        picture,
        googleId,
      },
      message: 'Complete your community setup to finish signing up with Google.',
    }
  }

  // Called when frontend uses access_token flow (implicit grant)
  // Frontend fetches userinfo from Google, sends here for lookup/create
  async loginWithGoogleUserInfo(profile: {
    email: string
    firstName: string
    lastName: string
    picture?: string
    googleId: string
  }) {
    const { email, firstName, lastName, picture } = profile

    let user = await this.prisma.userAccount.findFirst({
      where: { email: email.toLowerCase() },
    })

    if (user) {
      if (!user.isActive) throw new UnauthorizedException('This account has been suspended.')

      await this.prisma.userAccount.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          profilePhotoUrl: user.profilePhotoUrl ?? picture,
          // Update name from Google if they haven't been verified yet
          ...(!user.firstName && firstName ? { firstName } : {}),
          ...(!user.lastName  && lastName  ? { lastName  } : {}),
        },
      })

      const tokens = await (this.authService as any).generateTokens(user.id, user.institutionId, user.role)
      return {
        isNewUser: false,
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, institutionId: user.institutionId, profilePhotoUrl: user.profilePhotoUrl ?? picture },
        tokens,
      }
    }

    // New user — return profile for pre-filling registration
    return {
      isNewUser: true,
      googleProfile: { email, firstName, lastName, picture, googleId: profile.googleId },
      message: 'Complete your community setup to finish signing up with Google.',
    }
  }
}
