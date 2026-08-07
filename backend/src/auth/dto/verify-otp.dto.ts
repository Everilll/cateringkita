import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OtpPurpose } from 'generated/prisma/client';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
