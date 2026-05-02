import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { uploadInspirationCv } from '../controllers/upload.controller';
import { ValidationError } from '../utils/errors';

export const router = Router();

// Wrap multer so its errors feed into our error middleware
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadMiddleware.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const detail =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File must be 5 MB or smaller.'
          : err.message;
      return next(new ValidationError(err.code, detail, 'file'));
    }
    if (err instanceof Error) {
      return next(new ValidationError('invalid_file', err.message, 'file'));
    }
    next();
  });
};

router.post('/', authenticate, handleUpload, uploadInspirationCv);

export default router;
