import { Request, Response, NextFunction } from 'express';
import { listCvs } from '../models/cv.model';
import { buildPaginatedResponse } from '../utils/pagination';

export const getCvList = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const page_size = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.page_size ?? '20'), 10)),
    );

    const type = req.query.type as string | undefined;
    const sort = req.query.sort as string | undefined;
    const tagsRaw = req.query.tags as string | undefined;
    const search = req.query.search as string | undefined;
    const tags = tagsRaw ? tagsRaw.split(',').filter(Boolean) : undefined;

    const validTypes = ['EDITABLE_TEMPLATE', 'EDITABLE_USER', 'INSPIRATION_UPLOAD'];
    const validSorts = ['newest', 'upvotes'];

    const { count, results } = await listCvs({
      type: validTypes.includes(type ?? '')
        ? (type as 'EDITABLE_TEMPLATE' | 'EDITABLE_USER' | 'INSPIRATION_UPLOAD')
        : undefined,
      sort: validSorts.includes(sort ?? '') ? (sort as 'newest' | 'upvotes') : 'newest',
      tags,
      search,
      page,
      page_size,
    });

    const queryParams: Record<string, string> = {};
    if (type) queryParams.type = type;
    if (sort) queryParams.sort = sort;
    if (tagsRaw) queryParams.tags = tagsRaw;
    if (search) queryParams.search = search;

    res.json(
      buildPaginatedResponse({
        count,
        page,
        page_size,
        basePath: '/api/v1/cvs/',
        queryParams,
        results,
      }),
    );
  } catch (err) {
    next(err);
  }
};
