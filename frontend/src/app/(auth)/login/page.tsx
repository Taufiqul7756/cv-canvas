'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useMutationWithTokenRefresh } from '@/hooks/useMutationWithTokenRefresh';
import { authService } from '@/service/authService';
import { useToast } from '@/providers/ToastProvider';
import { ApiError } from '@/types/Types';
import type { User } from '@/types/models/User';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof schema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) });

  const mutation = useMutationWithTokenRefresh<User, LoginFormData>(
    (data) => authService().login(data),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['auth', 'me'], data);
        toast.success('Welcome back!');
        const next = searchParams.get('next');
        router.push(next?.startsWith('/') ? next : '/');
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.errors[0]?.code === 'invalid_credentials') {
            setError('root', { message: 'Email or password is incorrect' });
          } else {
            toast.error(error.errors[0]?.detail ?? 'Login failed');
          }
        }
      },
    },
  );

  const next = searchParams.get('next');
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : '/register';

  return (
    <div>
      <h1 className="mb-6 text-center text-xl font-medium text-ink">Sign in to CV Canvas</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {errors.root && (
          <p className="rounded-card bg-danger/10 px-3 py-2 text-sm text-danger">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" loading={mutation.isPending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link href={registerHref} className="font-medium text-brand hover:text-brand-dark">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-4"><Spinner /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
