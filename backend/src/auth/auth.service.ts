import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { HashingService } from '../common/hashing/hashing.service';
import { OtpService } from './otp/otp.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { GoogleProfilePayload } from './strategies/google.strategy';
import { User } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly hashing: HashingService,
    private readonly otpService: OtpService,
    private readonly config: ConfigService,
  ) {}

  // ── Register (email + password) ──────────────────────────────────
  async register(
    name: string,
    email: string,
    password: string,
    phone: string,
    role: 'CUSTOMER' | 'VENDOR',
  ) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const passwordHash = this.hashing.hash(password);
    const user = await this.usersService.create({
      name,
      email,
      password: passwordHash,
      phone,
      role,
    });

    await this.otpService.sendOtp(user.id, email, 'EMAIL_VERIFICATION');
  }

  // ── Login (email + password) ─────────────────────────────────────
  async login(email: string, password: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    const genericError = () =>
      new UnauthorizedException('Email atau password salah');

    if (!user || !user.password) {
      throw genericError();
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Akun belum terverifikasi. Selesaikan verifikasi OTP terlebih dahulu.',
      );
    }

    const isValid = this.hashing.verify(password, user.password);
    if (!isValid) {
      throw genericError();
    }

    return this.issueToken(user);
  }

  // ── Google OAuth ─────────────────────────────────────────────────
  async handleGoogleLogin(profile: GoogleProfilePayload) {
    const user = await this.usersService.findOrCreateGoogleUser(
      profile.googleId,
      profile.email,
      profile.name,
    );

    return {
      token: this.issueToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredCity: user.preferredCity,
      },
    };
  }

  // ── OTP: verify ──────────────────────────────────────────────────
  async verifyOtp(email: string, code: string, purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Kode OTP tidak valid atau kedaluwarsa');
    }

    await this.otpService.verifyOtp(user.id, code, purpose);
  }

  // ── OTP: resend ──────────────────────────────────────────────────
  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email tidak ditemukan');
    }

    await this.otpService.sendOtp(user.id, email, 'EMAIL_VERIFICATION');
  }

  // ── Forgot password ──────────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.authProvider !== 'EMAIL') return; // silent fail for security
    await this.otpService.sendOtp(user.id, email, 'PASSWORD_RESET');
  }

  // ── Reset password ───────────────────────────────────────────────
  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Kode OTP tidak valid atau kedaluwarsa');
    }

    await this.otpService.verifyOtp(user.id, code, 'PASSWORD_RESET');

    const passwordHash = this.hashing.hash(newPassword);
    await this.usersService.update(user.id, { password: passwordHash });
  }

  // ── Update preferred city ────────────────────────────────────────
  async updateCity(userId: string, city: string) {
    return this.usersService.update(userId, { preferredCity: city });
  }

  // ── Get me ───────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isEmailVerified: true,
        preferredCity: true,
        authProvider: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return user;
  }

  // ── Token helper ─────────────────────────────────────────────────
  issueToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwt.sign(payload);
  }
}
