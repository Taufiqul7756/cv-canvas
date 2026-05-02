import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const listQueue = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cvs = await db.cv.findMany({
      where: { type: 'INSPIRATION_UPLOAD', status: 'PENDING', is_deleted: false },
      include: { user: { select: { id: true, email: true, full_name: true } } },
      orderBy: { created_at: 'asc' },
    });
    res.json(cvs);
  } catch (err) {
    next(err);
  }
};

export const approveCv = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) throw new ForbiddenError();
    const id = parseInt(req.params.cvId, 10);

    const cv = await db.cv.findFirst({
      where: { id, type: 'INSPIRATION_UPLOAD', is_deleted: false },
    });
    if (!cv) throw new NotFoundError('CV not found.');

    const updated = await db.cv.update({
      where: { id },
      data: { status: 'APPROVED', is_public: true },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const rejectCv = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) throw new ForbiddenError();
    const id = parseInt(req.params.cvId, 10);

    const cv = await db.cv.findFirst({
      where: { id, type: 'INSPIRATION_UPLOAD', is_deleted: false },
    });
    if (!cv) throw new NotFoundError('CV not found.');

    const updated = await db.cv.update({
      where: { id },
      data: { status: 'REJECTED', is_public: false },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
