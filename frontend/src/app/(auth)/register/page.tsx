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

const schema = z
  .object({
    full_name: z.string().optional(),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/(?=.*[a-zA-Z])/, 'Password must contain at least one letter')
      .regex(/(?=.*\d)/, 'Password must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof schema>;

type RegisterPayload = { email: string; password: string; full_name?: string };

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(schema) });

  const mutation = useMutationWithTokenRefresh<User, RegisterPayload>(
    (data) => authService().register(data),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['auth', 'me'], data);
        toast.success('Account created! Welcome to CV Canvas.');
        const next = searchParams.get('next');
        router.push(next?.startsWith('/') ? next : '/');
      },
      onError: (error) => {
        if (!(error instanceof ApiError)) return;
        const emailExists = error.errors.find(
          (e) => e.attr === 'email' && e.code === 'email_exists',
        );
        if (emailExists) {
          setError('email', { message: 'This email is already registered' });
          return;
        }
        for (const err of error.errors) {
          if (err.attr === 'email' || err.attr === 'password' || err.attr === 'full_name') {
            setError(err.attr, { message: err.detail });
            return;
          }
        }
        toast.error(error.errors[0]?.detail ?? 'Registration failed');
      },
    },
  );

  const next = searchParams.get('next');
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  const onSubmit = (data: RegisterFormData) => {
    mutation.mutate({
      email: data.email,
      password: data.password,
      full_name: data.full_name?.trim() || undefined,
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-center text-xl font-medium text-ink">Create your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="full_name">
            Full name{' '}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <Input
            id="full_name"
            type="text"
            placeholder="Jane Smith"
            autoComplete="name"
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-danger">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="reg-email">
            Email
          </label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="reg-password">
            Password
          </label>
          <Input
            id="reg-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-ink"
            htmlFor="confirm_password"
          >
            Confirm password
          </label>
          <Input
            id="confirm_password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirm_password')}
          />
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-danger">{errors.confirm_password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="rounded-card bg-danger/10 px-3 py-2 text-sm text-danger">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" loading={mutation.isPending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href={loginHref} className="font-medium text-brand hover:text-brand-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-4"><Spinner /></div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
