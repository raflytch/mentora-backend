import { Category, UserRole } from '@prisma/client';

export interface CategoryWithRelations extends Category {
  materials: unknown[];
  created_by: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
}
