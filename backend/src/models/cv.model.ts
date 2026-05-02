import { Prisma } from '@prisma/client';
import { db } from '../db';

type CvTypeFilter = 'EDITABLE_TEMPLATE' | 'EDITABLE_USER' | 'INSPIRATION_UPLOAD';
type SortOption = 'newest' | 'upvotes';

interface ListCvsOptions {
  type?: CvTypeFilter;
  sort?: SortOption;
  tags?: string[];
  search?: string;
  page: number;
  page_size: number;
}

export const cvPublicInclude = {
  user: {
    select: { id: true, email: true, full_name: true, avatar_url: true },
  },
} as const;

export const listCvs = async (opts: ListCvsOptions) => {
  const where: Prisma.CvWhereInput = {
    is_public: true,
    status: 'APPROVED',
    is_deleted: false,
    ...(opts.type && { type: opts.type }),
    ...(opts.tags?.length && { tags: { hasSome: opts.tags } }),
    ...(opts.search && { title: { contains: opts.search, mode: 'insensitive' } }),
  };

  const orderBy: Prisma.CvOrderByWithRelationInput =
    opts.sort === 'upvotes' ? { upvotes_count: 'desc' } : { created_at: 'desc' };

  const [count, results] = await Promise.all([
    db.cv.count({ where }),
    db.cv.findMany({
      where,
      orderBy,
      skip: (opts.page - 1) * opts.page_size,
      take: opts.page_size,
      include: cvPublicInclude,
    }),
  ]);

  return { count, results };
};
