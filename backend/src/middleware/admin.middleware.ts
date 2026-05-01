import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({
      type: 'forbidden',
      errors: [{ code: 'admin_only', detail: 'Admin access required.' }],
    });
    return;
  }
  next();
};
