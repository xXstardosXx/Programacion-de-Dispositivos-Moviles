import { Router } from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  removeRecipeFromGroup,
  saveRecipeToGroup,
  getSavedGroupsForRecipe,
} from '../controllers/groupController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getGroups);
router.get('/recipe/:recipeId/saved', getSavedGroupsForRecipe);
router.get('/:id', getGroupById);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/:groupId/save/:recipeId', saveRecipeToGroup);
router.delete('/:groupId/recipes/:recipeId', removeRecipeFromGroup);

export default router;
