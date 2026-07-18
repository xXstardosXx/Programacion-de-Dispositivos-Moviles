import { Router } from 'express';
import { getMyReviews } from '../controllers/reviewController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/mine', authMiddleware, getMyReviews);

export default router;
