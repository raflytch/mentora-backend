import { User, UserRole, TeacherProfile, StudentProfile } from '@prisma/client';

export interface UserWithProfiles extends User {
  teacher_profile?: TeacherProfile | null;
  student_profile?: StudentProfile | null;
}

export interface AuthResponse {
  access_token: string;
  user: FormattedUserResponse;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface MessageResponse {
  message: string;
}

export interface GoogleUserData {
  email: string;
  full_name: string;
  profile_picture?: string | null;
  google_id: string;
}

export interface FormattedUserResponse {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  profile_picture?: string | null;
  phone?: string | null;
  is_email_verified: boolean;
  verification_status: string;
  created_at: Date;
  updated_at: Date;
  teacher_profile?: TeacherProfile | null;
  student_profile?: StudentProfile | null;
}

export interface StudentWithPurchases extends FormattedUserResponse {
  purchased_materials: PurchasedMaterial[];
  total_spent: number;
}

export interface PurchasedMaterial {
  id: string;
  title: string;
  price: number;
  purchased_at: Date | null;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
}

export interface UsersResponse {
  data: FormattedUserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthenticatedRequest extends Request {
  user: UserWithProfiles;
}

export interface GoogleAuthenticatedRequest extends Request {
  user: GoogleUserData;
}
