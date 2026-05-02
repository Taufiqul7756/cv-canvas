export interface User {
  id: number;
  email: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}
