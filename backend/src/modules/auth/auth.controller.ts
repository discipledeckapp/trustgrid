import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new institution and admin account' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone number or email address' })
  @ApiHeader({ name: 'X-Institution-ID', description: 'Institution ID', required: true })
  async login(
    @Body() dto: LoginDto,
    @Headers('x-institution-id') institutionId?: string,
  ) {
    return this.authService.login(dto, institutionId || undefined);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke refresh tokens' })
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.sub);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP via email or SMS' })
  async forgotPassword(@Body() body: { identifier: string }) {
    return this.authService.forgotPassword(body.identifier)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  async resetPassword(@Body() body: { identifier: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.identifier, body.otp, body.newPassword)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@Req() req: any) {
    return req.user;
  }
}
