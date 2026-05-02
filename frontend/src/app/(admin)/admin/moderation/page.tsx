'use client';

import Image from 'next/image';
import { CheckCircle, XCircle, FileText, Clock } from 'lucide-react';
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

  const isImage = cv.file_mime_type?.startsWith('image/');
  const isPdf = cv.file_mime_type === 'application/pdf';
  const fileUrl = cv.file_url ? `http://localhost:8080${cv.file_url}` : null;

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-start">
      {/* Preview */}
      <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-card bg-surface-2">
        {isImage && fileUrl ? (
          <Image src={fileUrl} alt={cv.title} width={112} height={112} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <FileText className="h-8 w-8 text-ink-subtle" />
            {isPdf && <span className="text-xs font-medium text-ink-muted">PDF</span>}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-ink">{cv.title}</h3>
            <p className="text-xs text-ink-muted">
              by {cv.user.full_name ?? cv.user.email} ·{' '}
              {new Date(cv.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="upload">Inspiration</Badge>
        </div>

        {cv.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cv.tags.map((tag) => (
              <span key={tag} className="rounded-chip bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
                {tag}
              </span>
            ))}
          </div>
        )}

        {cv.original_file_name && (
          <p className="text-xs text-ink-subtle">{cv.original_file_name}</p>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            loading={approve.isPending}
            onClick={() => approve.mutate(cv.id)}
            className="gap-1.5"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={reject.isPending}
            onClick={() => reject.mutate(cv.id)}
            className="gap-1.5"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
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
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Moderation Queue</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Review uploaded CVs before they go public.
          </p>
        </div>
        {queue && queue.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-chip bg-warn/10 px-3 py-1 text-sm font-medium text-warn">
            <Clock className="h-3.5 w-3.5" />
            {queue.length} pending
          </span>
        )}
      </div>

      {!queue || queue.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All caught up!"
          description="No uploads are waiting for review."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {queue.map((cv) => (
            <QueueItem key={cv.id} cv={cv} onAction={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
