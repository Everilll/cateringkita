import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { HashingService } from '../../common/hashing/hashing.service';
import { MailerService } from '../mailer/mailer.service';
import { randomInt } from 'node:crypto';
import { OtpPurpose } from 'generated/prisma/client';

@Injectable()
export class OtpService {
  private readonly otpLength: number;
  private readonly ttlMinutes: number;

  private readonly requestLog = new Map<string, number[]>();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly hashing: HashingService,
    private readonly mailer: MailerService,
  ) {
    this.otpLength = 6;
    this.ttlMinutes = this.config.get<number>('OTP_EXPIRES_MINUTES') || 10;
  }

  private checkRateLimit(email: string) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 1; // 1 request per 60 seconds as per API spec

    const timestamps = (this.requestLog.get(email) ?? []).filter(
      (t) => now - t < windowMs,
    );

    if (timestamps.length >= maxRequests) {
      throw new BadRequestException(
        'Terlalu banyak permintaan OTP. Coba lagi dalam beberapa menit.',
      );
    }

    timestamps.push(now);
    this.requestLog.set(email, timestamps);
  }

  private generateCode(): string {
    const min = 10 ** (this.otpLength - 1);
    const max = 10 ** this.otpLength - 1;
    return String(randomInt(min, max + 1));
  }

  async sendOtp(userId: string, email: string, purpose: OtpPurpose): Promise<void> {
    this.checkRateLimit(email);

    const code = this.generateCode();
    const hashedCode = this.hashing.hash(code);

    await this.prisma.otpCode.create({
      data: {
        userId,
        code: hashedCode,
        purpose,
        expiresAt: new Date(Date.now() + this.ttlMinutes * 60_000),
      },
    });

    await this.mailer.sendOtp(email, code, this.ttlMinutes);
  }

  async verifyOtp(
    userId: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    const otpRecords = await this.prisma.otpCode.findMany({
      where: {
        userId,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const matched = otpRecords.find((otp) =>
      this.hashing.verify(code, otp.code),
    );

    if (!matched) {
      throw new UnauthorizedException('Kode OTP tidak valid atau kedaluwarsa');
    }

    await this.prisma.otpCode.update({
      where: { id: matched.id },
      data: { consumedAt: new Date() },
    });

    if (purpose === 'EMAIL_VERIFICATION') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });
    }
  }
}
