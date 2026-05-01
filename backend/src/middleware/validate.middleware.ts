import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      if (source === 'body') req.body = parsed;
      else if (source === 'query') req.query = parsed as typeof req.query;
      else req.params = parsed as typeof req.params;
      next();
    } catch (err) {
      next(err);
    }
  };
