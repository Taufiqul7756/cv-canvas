import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';
import type { User } from '@/types/models/User';

export function useRequireAuth(): { user: User | null; isLoading: boolean } {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  return { user, isLoading };
}
