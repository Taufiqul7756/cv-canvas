'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return null;
  }

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
