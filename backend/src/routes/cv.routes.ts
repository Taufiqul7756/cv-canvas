import { Router } from 'express';
import { getCvList } from '../controllers/cv.controller';

export const router = Router();

router.get('/', getCvList);

export default router;
