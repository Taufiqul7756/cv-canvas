import { TextareaHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={twMerge(
        'w-full rounded-card border border-line-strong bg-surface px-3 py-2 text-sm text-ink',
        'placeholder:text-ink-subtle resize-y',
        'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
