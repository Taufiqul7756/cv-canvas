import { clsx } from 'clsx';
import { ReactNode } from 'react';

type BadgeVariant = 'template' | 'upload' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  template: 'bg-tag-template-bg text-tag-template-text',
  upload: 'bg-tag-upload-bg text-tag-upload-text',
  neutral: 'bg-surface-2 text-ink-muted',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-chip px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
