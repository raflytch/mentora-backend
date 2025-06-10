export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
