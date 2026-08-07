import type { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Redirect,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OtpService } from './otp/otp.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { RawResponse, MessageResponse } from '../common/interceptors/transform.interceptor';
import type { GoogleProfilePayload } from './strategies/google.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly config: ConfigService,
  ) {}

  // ── POST /auth/register ──────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar akun baru (CUSTOMER atau VENDOR)' })
  @ApiOkResponse({ description: 'Akun dibuat, kode OTP dikirim ke email.' })
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(
      dto.name,
      dto.email,
      dto.password,
      dto.phone,
      dto.role as 'CUSTOMER' | 'VENDOR',
    );
    return new MessageResponse(
      null,
      'Registrasi berhasil, kode OTP telah dikirim ke email kamu',
    );
  }

  // ── POST /auth/verify-otp ────────────────────────────────────────
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi OTP (email verification / password reset)' })
  @ApiOkResponse({ description: 'OTP valid.' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    await this.authService.verifyOtp(dto.email, dto.code, dto.purpose);
    return new MessageResponse(null, 'Kode OTP berhasil diverifikasi');
  }

  // ── POST /auth/resend-otp ────────────────────────────────────────
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim ulang OTP (rate-limited)' })
  @ApiOkResponse({ description: 'Kode OTP baru dikirim ke email.' })
  async resendOtp(@Body() dto: ForgotPasswordDto) {
    await this.authService.resendOtp(dto.email);
    return new MessageResponse(null, 'Kode OTP telah dikirim ke email kamu');
  }

  // ── POST /auth/login ─────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login email + password' })
  @ApiOkResponse({ description: 'Login berhasil, mengembalikan JWT.' })
  @ApiResponse({ status: 401, description: 'Email/password salah atau belum verifikasi.' })
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto.email, dto.password);
    return new RawResponse({ token });
  }

  // ── GET /auth/google ─────────────────────────────────────────────
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect ke Google OAuth consent screen' })
  @ApiResponse({ status: 302, description: 'Redirect ke Google.' })
  googleLogin() {}

  // ── GET /auth/google/callback ────────────────────────────────────
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  @ApiOperation({ summary: 'Callback Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirect ke frontend dengan token di query string.' })
  async googleCallback(@CurrentUser() profile: GoogleProfilePayload) {
    const result = await this.authService.handleGoogleLogin(profile);
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return {
      url: `${frontendUrl}/auth/google/callback?token=${result.token}`,
      statusCode: 302,
    };
  }

  // ── POST /auth/forgot-password ───────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim OTP untuk reset password (hanya akun EMAIL)' })
  @ApiOkResponse({ description: 'Jika email terdaftar, kode OTP akan dikirim.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return new MessageResponse(
      null,
      'Jika email terdaftar, kode OTP telah dikirim',
    );
  }

  // ── POST /auth/reset-password ────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi OTP + set password baru' })
  @ApiOkResponse({ description: 'Password berhasil diubah.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
    return new MessageResponse(null, 'Password berhasil diubah, silakan login kembali');
  }

  // ── GET /auth/me ─────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ambil data user yang sedang login' })
  @ApiOkResponse({ description: 'Data profil user.' })
  async me(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }

  // ── PATCH /auth/me/city ──────────────────────────────────────────
  @Patch('me/city')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Set/update preferredCity user' })
  @ApiOkResponse({ description: 'Kota berhasil diperbarui.' })
  async updateCity(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCityDto,
  ) {
    await this.authService.updateCity(user.sub, dto.city);
    return new MessageResponse(null, 'Kota berhasil diperbarui');
  }
}
