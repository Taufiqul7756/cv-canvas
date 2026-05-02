import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
        <Icon className="h-7 w-7 text-ink-subtle" />
      </div>
      <div>
        <h3 className="text-base font-medium text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      {cta}
    </div>
  );
}
