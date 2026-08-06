// shared/types/enums.ts
export enum Role {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  WARNED = 'WARNED',
  FROZEN = 'FROZEN',
}

export enum MenuCategory {
  MAKANAN = 'MAKANAN',
  MINUMAN = 'MINUMAN',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
}

export enum OtpPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}
