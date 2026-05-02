import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { ForbiddenError, ValidationError } from '../utils/errors';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

interface MagicResult {
  mime: string;
  ext: string;
}

// Detect file type from magic bytes — no external package needed
function detectMagic(buf: Buffer): MagicResult | null {
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)
    return { mime: 'application/pdf', ext: 'pdf' };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return { mime: 'image/png', ext: 'png' };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return { mime: 'image/jpeg', ext: 'jpg' };
  return null;
}

export const uploadInspirationCv = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) throw new ForbiddenError();

    if (!req.file) {
      throw new ValidationError('required', 'A file is required.', 'file');
    }

    // Validate magic bytes — trust content, not just the declared MIME type
    const detected = detectMagic(req.file.buffer);
    if (!detected) {
      throw new ValidationError(
        'invalid_file_type',
        'File must be a PDF, PNG, or JPG.',
        'file',
      );
    }

    const { title, tags } = req.body as { title?: string; tags?: string };
    if (!title?.trim()) {
      throw new ValidationError('required', 'Title is required.', 'title');
    }

    const parsedTags = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Persist file to disk
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${detected.ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer);

    const cv = await db.cv.create({
      data: {
        title: title.trim(),
        type: 'INSPIRATION_UPLOAD',
        status: 'PENDING',
        is_public: false,
        tags: parsedTags,
        file_url: `/uploads/${filename}`,
        original_file_name: req.file.originalname,
        file_mime_type: detected.mime,
        user_id: req.user.id,
      },
    });

    res.status(201).json(cv);
  } catch (err) {
    next(err);
  }
};
