'use client';

import { createContext, ReactNode } from 'react';
import { useQueryWithTokenRefresh } from '@/hooks/useQueryWithTokenRefresh';
import { authService } from '@/service/authService';
import type { User } from '@/types/models/User';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useQueryWithTokenRefresh<User>(
    ['auth', 'me'],
    () => authService().getMe(),
  );

  return (
    <AuthContext.Provider
      value={{
        user: data ?? null,
        isLoading,
        refetch: () => {
          void refetch();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
