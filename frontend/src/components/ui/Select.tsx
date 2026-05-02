import { SelectHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={twMerge(
        'w-full rounded-card border border-line-strong bg-surface px-3 py-2 text-sm text-ink',
        'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
