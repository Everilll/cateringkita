// shared/types/vendor.ts
import { AccountStatus, MenuCategory } from './enums';

export interface MenuItemSummary {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  minOrderQty: number;
  photo: string | null;
}

// Response bentuk GET /vendors (list)
export interface VendorSummary {
  id: string;
  businessName: string;
  area: string;
  bannerPhoto: string | null;
  profilePhoto: string | null;
  isVerifiedBadge: boolean;
  averageRating: number;
  accountStatus: AccountStatus;
}

// Response bentuk GET /vendors/:id (public detail)
export interface VendorDetail extends VendorSummary {
  waNumber: string;
  menuItems: MenuItemSummary[]; // hanya isActive: true
}

// Response bentuk GET /vendors/me (dashboard vendor sendiri)
export interface VendorMe extends VendorDetail {
  paymentInfo: string;
  totalUnpaidCommission: number;
  menuItems: (MenuItemSummary & { isActive: boolean })[]; // termasuk isActive: false
}

// Request POST /vendors/me, PATCH /vendors/me
export interface UpsertVendorProfileDto {
  businessName: string;
  area: string;
  waNumber: string;
  paymentInfo: string;
}

// Query params GET /vendors
export interface VendorListQuery {
  area?: string;
  category?: MenuCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}
