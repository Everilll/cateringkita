// shared/types/auth.ts
import { Role, AuthProvider } from './enums';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
  preferredCity: string | null;
}

// Request POST /auth/register
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role.CUSTOMER | Role.VENDOR;
}

// Request POST /auth/login
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// Request POST /auth/verify-otp
export interface VerifyOtpDto {
  email: string;
  code: string;
  purpose: 'EMAIL_VERIFICATION';
}

// Request POST /auth/resend-otp
export interface ResendOtpDto {
  email: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}

// Request POST /auth/forgot-password
export interface ForgotPasswordDto {
  email: string;
}

// Request POST /auth/reset-password
export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

// Request PATCH /auth/me/city
export interface SetPreferredCityDto {
  city: string;
}
