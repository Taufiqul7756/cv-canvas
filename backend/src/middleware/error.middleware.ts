import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/errors';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      type: err.type,
      errors: [
        {
          code: err.code,
          detail: err.detail,
          ...(err.attr !== undefined ? { attr: err.attr } : {}),
        },
      ],
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      type: 'validation_error',
      errors: err.issues.map((issue) => ({
        code: issue.code,
        detail: issue.message,
        ...(issue.path.length > 0 ? { attr: issue.path.join('.') } : {}),
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({
        type: 'not_found',
        errors: [{ code: 'not_found', detail: 'Record not found.' }],
      });
      return;
    }
    if (err.code === 'P2002') {
      res.status(400).json({
        type: 'validation_error',
        errors: [{ code: 'unique_constraint', detail: 'A record with this value already exists.' }],
      });
      return;
    }
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    type: 'server_error',
    errors: [{ code: 'server_error', detail: 'An unexpected error occurred.' }],
  });
};
