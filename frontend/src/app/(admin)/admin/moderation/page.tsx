'use client';

import Image from 'next/image';
import { CheckCircle, XCircle, FileText, Clock, ExternalLink } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useQueryWithTokenRefresh } from '@/hooks/useQueryWithTokenRefresh';
import { useMutationWithTokenRefresh } from '@/hooks/useMutationWithTokenRefresh';
import { moderationService } from '@/service/moderationService';
import { useToast } from '@/providers/ToastProvider';
import type { Cv } from '@/types/models/Cv';

interface CvWithUser extends Cv {
  user: { id: number; email: string; full_name: string | null };
}

function FilePreview({ cv }: { cv: CvWithUser }) {
  const isImage = cv.file_mime_type === 'image/png' || cv.file_mime_type === 'image/jpeg';
  const isPdf = cv.file_mime_type === 'application/pdf';
  const url = cv.file_url ?? '';

  if (isImage) {
    return (
      <div className="relative h-96 w-full overflow-hidden rounded-card bg-surface-2">
        <Image
          src={url}
          alt={cv.title}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="overflow-hidden rounded-card border border-line">
        <iframe
          src={url}
          title={cv.title}
          className="h-[600px] w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-40 items-center justify-center rounded-card bg-surface-2">
      <FileText className="h-12 w-12 text-ink-subtle" />
    </div>
  );
}

function QueueItem({ cv, onAction }: { cv: CvWithUser; onAction: () => void }) {
  const toast = useToast();

  const approve = useMutationWithTokenRefresh<Cv, number>(
    (id) => moderationService().approve(id),
    {
      onSuccess: () => { toast.success(`"${cv.title}" approved.`); onAction(); },
      onError: () => toast.error('Could not approve. Try again.'),
    },
  );

  const reject = useMutationWithTokenRefresh<Cv, number>(
    (id) => moderationService().reject(id),
    {
      onSuccess: () => { toast.info(`"${cv.title}" rejected.`); onAction(); },
      onError: () => toast.error('Could not reject. Try again.'),
    },
  );

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      {/* Full-size preview */}
      <div className="p-4 pb-0">
        <FilePreview cv={cv} />
      </div>

      {/* Meta + actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-ink">{cv.title}</h3>
            <Badge variant="upload">Inspiration</Badge>
          </div>
          <p className="text-xs text-ink-muted">
            Uploaded by {cv.user.full_name ?? cv.user.email} ·{' '}
            {new Date(cv.created_at).toLocaleDateString()}
          </p>
          {cv.original_file_name && (
            <p className="text-xs text-ink-subtle">{cv.original_file_name}</p>
          )}
          {cv.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {cv.tags.map((tag) => (
                <span key={tag} className="rounded-chip bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cv.file_url && (
            <a
              href={cv.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-card border border-line-strong px-3 py-1.5 text-sm text-ink hover:bg-surface-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open full size
            </a>
          )}
          <Button
            variant="danger"
            size="sm"
            loading={reject.isPending}
            onClick={() => reject.mutate(cv.id)}
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={approve.isPending}
            onClick={() => approve.mutate(cv.id)}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const { data: queue, isLoading } = useQueryWithTokenRefresh<CvWithUser[]>(
    ['moderation', 'queue'],
    () => moderationService().listQueue(),
  );
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['moderation', 'queue'] });

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Moderation Queue</h1>
          <p className="mt-1 text-sm text-ink-muted">Review uploads before they go public.</p>
        </div>
        {queue && queue.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-chip bg-warn/10 px-3 py-1 text-sm font-medium text-warn">
            <Clock className="h-3.5 w-3.5" />
            {queue.length} pending
          </span>
        )}
      </div>

      {!queue?.length ? (
        <EmptyState icon={CheckCircle} title="All caught up!" description="No uploads waiting for review." />
      ) : (
        <div className="flex flex-col gap-6">
          {queue.map((cv) => <QueueItem key={cv.id} cv={cv} onAction={refetch} />)}
        </div>
      )}
    </div>
  );
}
