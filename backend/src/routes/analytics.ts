import { Router } from 'express';
import { getOverview, getRevenueTrend } from '../controllers/analytics.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate as any);

router.get('/overview', getOverview as any);
router.get('/trend', getRevenueTrend as any);

export default router;
