import { clsx } from 'clsx';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-brand',
        className ?? 'h-4 w-4',
      )}
      aria-label="Loading"
    />
  );
}
