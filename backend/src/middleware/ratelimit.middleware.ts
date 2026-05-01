import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';
import { ApiError } from '../utils/errors';

interface RateLimitOptions {
  windowSec: number;
  max: number;
  key: (req: Request) => string;
}

export const rateLimit =
  ({ windowSec, max, key }: RateLimitOptions) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const redisKey = `ratelimit:${key(req)}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSec);
      }
      if (count > max) {
        next(
          new ApiError(429, 'rate_limit_exceeded', 'rate_limit_exceeded', 'Too many requests. Please try again later.'),
        );
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
