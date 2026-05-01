import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/ratelimit.middleware';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export const router = Router();

router.post(
  '/register',
  rateLimit({ windowSec: 3600, max: 10, key: (req) => `register:${req.ip ?? 'unknown'}` }),
  validate(registerSchema, 'body'),
  register,
);

router.post(
  '/login',
  rateLimit({ windowSec: 60, max: 5, key: (req) => `login:${req.ip ?? 'unknown'}` }),
  validate(loginSchema, 'body'),
  login,
);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
