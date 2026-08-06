// shared/types/rating.ts

export interface Rating {
  id: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  score: number; // 1-5
  comment: string | null;
  createdAt: string;
}

// Request POST /orders/:id/rating
export interface CreateRatingDto {
  score: number; // 1-5
  comment?: string;
}
