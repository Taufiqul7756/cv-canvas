'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/providers/ToastProvider';
import { uploadService } from '@/service/uploadService';
import { ApiError } from '@/types/Types';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('Only PDF, PNG, and JPG files are accepted');
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error('File must be under 5 MB');
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    if (!title.trim()) { toast.error('Please enter a title'); return; }
    if (!agreed) { toast.error('Please accept the upload terms'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title.trim());
      if (tags.trim()) fd.append('tags', tags.trim());

      await uploadService().uploadInspirationCv(fd);
      toast.success('Uploaded! Your CV is pending admin review.');
      router.push('/my-cvs');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.errors[0]?.detail ?? 'Upload failed');
      } else {
        toast.error('Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Upload a CV</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Share a PDF or image of an existing CV as inspiration for the community.
          An admin will review it before it goes public.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-12 transition-colors
            ${dragOver
              ? 'border-brand bg-brand-light'
              : 'border-line-strong bg-surface-2 hover:border-brand hover:bg-brand-light'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {file ? (
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-brand" />
              <div className="text-left">
                <p className="text-sm font-medium text-ink">{file.name}</p>
                <p className="text-xs text-ink-muted">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(''); }}
                className="ml-2 rounded-full p-1 text-ink-subtle hover:text-danger"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-ink-subtle" />
              <div className="text-center">
                <p className="text-sm font-medium text-ink">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-ink-muted">PDF, PNG, JPG — max 5 MB</p>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="cv-title">
            Title
          </label>
          <Input
            id="cv-title"
            placeholder="e.g. Software Engineer Resume 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="cv-tags">
            Tags{' '}
            <span className="font-normal text-ink-muted">(optional, comma-separated)</span>
          </label>
          <Input
            id="cv-tags"
            placeholder="e.g. tech, minimal, two-column"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Consent notice */}
        <div className="rounded-card border border-line bg-surface-2 p-4">
          <label className="flex cursor-pointer gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand"
            />
            <span className="text-sm text-ink-muted">
              I confirm this file does not contain private information I don&apos;t want
              shared, and I have the right to upload it. I understand it will be reviewed
              by an admin before going public.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          disabled={!agreed}
        >
          Upload CV
        </Button>
      </form>
    </div>
  );
}
