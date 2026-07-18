import { Router } from 'express';
import {
  getCatalog,
  getMyCatalog,
  getTrending,
  searchGames,
  importGame,
  getGameDetail,
  getGenres,
  getDiscover,
  hideGame,
  unhideGame,
} from '../controllers/gameController';
import { upsertReview, deleteReview } from '../controllers/reviewController';
import { authMiddleware } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';

const router = Router();

router.get('/', optionalAuth, getCatalog);
router.get('/mine', authMiddleware, getMyCatalog);
router.get('/trending', optionalAuth, getTrending);
router.get('/genres', getGenres);
router.get('/discover', getDiscover);
router.get('/search', optionalAuth, searchGames);
router.post('/import', authMiddleware, importGame);
router.post('/:id/hide', authMiddleware, hideGame);
router.delete('/:id/hide', authMiddleware, unhideGame);
router.get('/:id', optionalAuth, getGameDetail);

router.post('/:gameId/review', authMiddleware, upsertReview);
router.delete('/:gameId/review', authMiddleware, deleteReview);

export default router;
