import { Router, Request, Response } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import cvRouter from './cv.routes';
import templateRouter from './template.routes';
import uploadRouter from './upload.routes';
import moderationRouter from './moderation.routes';
import paymentRouter from './payment.routes';
import adminRouter from './admin.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/cvs', cvRouter);
router.use('/templates', templateRouter);
router.use('/uploads', uploadRouter);
router.use('/moderation', moderationRouter);
router.use('/payments', paymentRouter);
router.use('/admin', adminRouter);

export default router;
