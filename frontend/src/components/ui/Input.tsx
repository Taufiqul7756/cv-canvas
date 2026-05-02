import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={twMerge(
        'w-full rounded-card border border-line-strong bg-surface px-3 py-2 text-sm text-ink',
        'placeholder:text-ink-subtle',
        'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
