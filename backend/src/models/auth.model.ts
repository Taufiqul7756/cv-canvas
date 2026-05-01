import { db } from '../db';
import { hashPassword } from '../utils/password';
import { RegisterInput } from '../validators/auth.validator';

export const userPublicSelect = {
  id: true,
  email: true,
  full_name: true,
  bio: true,
  avatar_url: true,
  role: true,
  is_active: true,
  email_verified: true,
  created_at: true,
  updated_at: true,
} as const;

export const createUser = async (data: RegisterInput) => {
  const hashed = await hashPassword(data.password);
  return db.user.create({
    data: {
      email: data.email,
      password: hashed,
      full_name: data.full_name,
    },
    select: userPublicSelect,
  });
};

// Includes password — for login comparison only. Never send this to client.
export const findByEmail = async (email: string) => {
  return db.user.findFirst({ where: { email } });
};

export const findById = async (id: number) => {
  return db.user.findFirst({
    where: { id, is_deleted: false },
    select: userPublicSelect,
  });
};
