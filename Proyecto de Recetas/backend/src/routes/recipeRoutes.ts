import { Router } from 'express';
import {
  getAllRecipes,
  getMyRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipeController';
import { rateRecipe } from '../controllers/ratingController';
import { authMiddleware } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';

const router = Router();

router.get('/', optionalAuth, getAllRecipes);
router.get('/mine', authMiddleware, getMyRecipes);
router.get('/:id', optionalAuth, getRecipeById);
router.post('/:id/rate', authMiddleware, rateRecipe);
router.post('/', authMiddleware, createRecipe);
router.put('/:id', authMiddleware, updateRecipe);
router.delete('/:id', authMiddleware, deleteRecipe);

export default router;
