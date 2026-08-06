// shared/types/response.ts
// Sesuai TransformInterceptor dari nest-common (backend/src/common/interceptors/transform.interceptor.ts)

export interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  data: null;
  error: string;
  timestamp: string;
}

export interface UploadResponse {
  url: string;
}
