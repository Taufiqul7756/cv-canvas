import Image from 'next/image';
import { LayoutTemplate, ThumbsUp, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { CvWithUser } from '@/service/cvService';

interface CvCardProps {
  cv: CvWithUser;
}

function CardPreview({ cv }: { cv: CvWithUser }) {
  const isImage = cv.file_mime_type === 'image/png' || cv.file_mime_type === 'image/jpeg';
  const isPdf = cv.file_mime_type === 'application/pdf';

  if (isImage && cv.file_url) {
    return (
      <Image
        src={cv.file_url}
        alt={cv.title}
        fill
        className="object-cover"
        unoptimized
      />
    );
  }

  if (isPdf && cv.file_url) {
    return (
      // pointer-events-none keeps the card clickable; the iframe is visual only
      <iframe
        src={cv.file_url}
        title={cv.title}
        className="pointer-events-none h-full w-full"
        tabIndex={-1}
      />
    );
  }

  // Fallback for templates / user CVs (no file yet)
  return <LayoutTemplate className="h-10 w-10 text-ink-subtle" />;
}

export function CvCard({ cv }: CvCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-md">
      {/* Preview */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-surface-2">
        <CardPreview cv={cv} />

        {/* Type badge */}
        <div className="absolute right-2 top-2 z-10">
          {cv.type === 'INSPIRATION_UPLOAD' && <Badge variant="upload">Inspiration</Badge>}
          {cv.type === 'EDITABLE_TEMPLATE' && <Badge variant="template">Template</Badge>}
          {cv.type === 'EDITABLE_USER' && <Badge variant="neutral">User CV</Badge>}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-1 text-sm font-medium text-ink">{cv.title}</h3>
        <p className="text-xs text-ink-muted">{cv.user.full_name ?? cv.user.email}</p>

        {cv.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cv.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-chip bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-ink-subtle">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {cv.upvotes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {cv.comments_count}
          </span>
        </div>
      </div>
    </div>
  );
}
