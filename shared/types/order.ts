// shared/types/order.ts
import { OrderStatus } from './enums';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  vendorName: string;
  eventDate: string;
  address: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
}

// Request POST /orders
export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderDto {
  vendorId: string;
  eventDate: string; // "YYYY-MM-DD"
  address: string;
  items: CreateOrderItemInput[];
}
