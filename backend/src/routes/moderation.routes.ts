import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { listQueue, approveCv, rejectCv } from '../controllers/moderation.controller';

export const router = Router();

router.get('/queue', authenticate, requireAdmin, listQueue);
router.patch('/:cvId/approve', authenticate, requireAdmin, approveCv);
router.patch('/:cvId/reject', authenticate, requireAdmin, rejectCv);

export default router;
