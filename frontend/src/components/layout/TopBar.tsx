'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, User, Settings, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/service/authService';
import { useToast } from '@/providers/ToastProvider';

function getInitials(fullName: string | null, email: string): string {
  if (fullName?.trim()) {
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  return email[0].toUpperCase();
}

export function TopBar() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await authService().logout();
    } finally {
      setDropdownOpen(false);
      queryClient.setQueryData(['auth', 'me'], null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Signed out');
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex-shrink-0">
          <Logo />
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              placeholder="Search CVs..."
              className="w-full rounded-card border border-line-strong bg-surface-2 py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
              >
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name ?? 'Avatar'}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand">
                    {getInitials(user.full_name, user.email)}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-card border border-line bg-surface py-1 shadow-lg">
                  <Link
                    href="/my-cvs"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 text-ink-subtle" />
                    My CVs
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-ink-subtle" />
                    Settings
                  </Link>
                  <div className="my-1 border-t border-line" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2"
                  >
                    <LogOut className="h-4 w-4 text-ink-subtle" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-card px-3 py-1.5 text-sm font-medium text-ink transition-all hover:bg-surface-2"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-card bg-brand px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-brand-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
