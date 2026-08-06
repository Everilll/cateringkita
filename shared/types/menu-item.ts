// shared/types/menu-item.ts
import { MenuCategory } from './enums';

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  category: MenuCategory;
  price: number;
  minOrderQty: number;
  isActive: boolean;
  photo: string | null;
  description: string | null;
}

// Request POST /vendors/me/menu-items
export interface CreateMenuItemDto {
  name: string;
  category: MenuCategory;
  price: number;
  minOrderQty: number;
  description?: string;
}

// Request PATCH /menu-items/:id (semua field opsional)
export type UpdateMenuItemDto = Partial<CreateMenuItemDto>;
