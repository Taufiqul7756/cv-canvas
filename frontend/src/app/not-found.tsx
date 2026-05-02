import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={FileQuestion}
          title="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
          cta={
            <Link
              href="/"
              className="inline-flex items-center rounded-card bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-dark"
            >
              Go to homepage
            </Link>
          }
        />
      </main>
    </>
  );
}
