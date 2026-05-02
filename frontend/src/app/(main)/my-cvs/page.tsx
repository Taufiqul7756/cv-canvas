'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function MyCvsPage() {
  const router = useRouter();

  return (
    <EmptyState
      icon={FileText}
      title="No CVs yet"
      description="Fork a template or upload an inspiration to get started"
      cta={
        <Button variant="primary" onClick={() => router.push('/')}>
          Browse CVs
        </Button>
      }
    />
  );
}
