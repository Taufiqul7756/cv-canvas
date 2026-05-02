import { get, post } from '@/lib/api/authHandlers';
import type { User } from '@/types/models/User';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  full_name?: string;
}

export const authService = () => ({
  getMe: (): Promise<User> => get<User>('/auth/me'),
  login: (data: LoginInput): Promise<User> => post<User>('/auth/login', data),
  register: (data: RegisterInput): Promise<User> => post<User>('/auth/register', data),
  logout: (): Promise<void> => post<void>('/auth/logout', {}),
  refresh: (): Promise<void> => post<void>('/auth/refresh', {}),
});
