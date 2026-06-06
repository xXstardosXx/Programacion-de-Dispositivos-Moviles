import { Request, Response } from 'express';
import { Recipe } from '../models/Recipe';
import { Rating } from '../models/Rating';
import { getRatingStatsForRecipe } from '../utils/ratingHelpers';

export const rateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipeId = String(req.params.id);
    const { score } = req.body;

    if (!score || score < 1 || score > 5 || !Number.isInteger(score)) {
      res.status(400).json({ message: 'La calificación debe ser un número del 1 al 5' });
      return;
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ message: 'Receta no encontrada' });
      return;
    }

    if (recipe.user.toString() === req.userId!.toString()) {
      res.status(400).json({ message: 'No puedes calificar tu propia receta' });
      return;
    }

    await Rating.findOneAndUpdate(
      { user: req.userId, recipe: recipeId },
      { score },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const stats = await getRatingStatsForRecipe(recipeId, req.userId);

    res.json({
      message: 'Calificación guardada',
      ...stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al calificar receta', error });
  }
};
