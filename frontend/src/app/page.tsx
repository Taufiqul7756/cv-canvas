'use client';

import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold text-ink sm:text-5xl">
            Discover great CVs
          </h1>
          <p className="max-w-lg text-lg text-ink-muted">
            {user
              ? `Welcome back, ${user.full_name ?? user.email}`
              : 'Browse community-loved templates and upload your inspiration'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cvs"
              className="inline-flex items-center rounded-card bg-brand px-6 py-3 text-base font-medium text-white transition-all hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              Browse CVs
            </Link>
            {user ? (
              <Link
                href="/upload"
                className="inline-flex items-center rounded-card border border-line-strong bg-surface px-6 py-3 text-base font-medium text-ink transition-all hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                Upload a CV
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center rounded-card border border-line-strong bg-surface px-6 py-3 text-base font-medium text-ink transition-all hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                Sign up
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
