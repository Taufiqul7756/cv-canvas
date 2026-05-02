'use client';

import { useState } from 'react';
import { Search, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { TopBar } from '@/components/layout/TopBar';
import { CvCard } from '@/components/cv/CvCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQueryWithTokenRefresh } from '@/hooks/useQueryWithTokenRefresh';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cvService } from '@/service/cvService';
import type { PaginatedResponse } from '@/types/Types';
import type { CvType } from '@/types/models/Cv';
import type { CvWithUser } from '@/service/cvService';

type FilterType = CvType | 'ALL';
type SortOption = 'newest' | 'upvotes';

const TYPE_FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Inspirations', value: 'INSPIRATION_UPLOAD' },
  { label: 'Templates', value: 'EDITABLE_TEMPLATE' },
  { label: 'User CVs', value: 'EDITABLE_USER' },
];

export default function CvsPage() {
  const [activeType, setActiveType] = useState<FilterType>('ALL');
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useQueryWithTokenRefresh<PaginatedResponse<CvWithUser>>(
    ['cvs', { type: activeType, sort, search: debouncedSearch }],
    () =>
      cvService().listCvs({
        type: activeType === 'ALL' ? undefined : activeType,
        sort,
        search: debouncedSearch || undefined,
        page_size: 24,
      }),
  );

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Browse CVs</h1>
            {data && (
              <p className="mt-0.5 text-sm text-ink-muted">{data.count} CVs found</p>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-card border border-line-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        {/* Filter + Sort bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveType(f.value)}
                className={clsx(
                  'rounded-chip px-3 py-1.5 text-sm font-medium transition-all',
                  activeType === f.value
                    ? 'bg-brand text-white'
                    : 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-card border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="upvotes">Most Voted</option>
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !data?.results.length ? (
          <EmptyState
            icon={LayoutGrid}
            title="No CVs found"
            description="Try a different filter or be the first to upload one."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.results.map((cv) => (
              <CvCard key={cv.id} cv={cv} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
