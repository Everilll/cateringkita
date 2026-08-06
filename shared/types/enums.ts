// shared/types/enums.ts
// Harus sinkron persis dengan enum di backend/prisma/schema.prisma

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
