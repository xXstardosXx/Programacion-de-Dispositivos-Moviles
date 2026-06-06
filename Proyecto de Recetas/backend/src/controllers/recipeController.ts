import { Request, Response } from 'express';
import { Recipe, IIngredient } from '../models/Recipe';
import { Group } from '../models/Group';
import { SavedRecipe } from '../models/SavedRecipe';
import { Rating } from '../models/Rating';
import { Types } from 'mongoose';
import {
  attachRatingsToRecipes,
  getRatingStatsForRecipe,
} from '../utils/ratingHelpers';

const populateOptions = [
  { path: 'groups', select: 'name color' },
  { path: 'user', select: 'name email avatar' },
];

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const getAllRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipes = await Recipe.find()
      .populate(populateOptions)
      .sort({ title: 1 });

    const plain = recipes.map((r) => r.toJSON());
    const withRatings = await attachRatingsToRecipes(plain, req.userId);

    res.json(withRatings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener recetas', error });
  }
};

export const getMyRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipes = await Recipe.find({ user: req.userId })
      .populate(populateOptions)
      .sort({ title: 1 });

    const plain = recipes.map((r) => r.toJSON());
    const withRatings = await attachRatingsToRecipes(plain, req.userId);

    res.json(withRatings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener recetas personales', error });
  }
};

export const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(populateOptions);

    if (!recipe) {
      res.status(404).json({ message: 'Receta no encontrada' });
      return;
    }

    const stats = await getRatingStatsForRecipe(recipe._id, req.userId);

    res.json({ ...recipe.toJSON(), ...stats });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener receta', error });
  }
};

export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, image, ingredients, preparation, groupIds } = req.body;

    if (!title?.trim()) {
      res.status(400).json({ message: 'El título es obligatorio' });
      return;
    }

    if (image && image.length > MAX_IMAGE_SIZE) {
      res.status(400).json({
        message: 'La imagen es demasiado grande. Usa una imagen más pequeña.',
      });
      return;
    }

    const validIngredients = normalizeIngredients(ingredients);
    const validGroupIds = await validateGroupIds(groupIds, req.userId!);

    const recipe = await Recipe.create({
      title: title.trim(),
      image: image || '',
      ingredients: validIngredients,
      preparation: (preparation || '').trim(),
      groups: validGroupIds,
      user: req.userId,
    });

    const populated = await Recipe.findById(recipe._id).populate(populateOptions);
    res.status(201).json({ message: 'Receta creada', recipe: populated });
  } catch (error) {
    if (error instanceof Error && error.message.includes('grupos')) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Error al crear receta', error });
  }
};

export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, user: req.userId });

    if (!recipe) {
      res.status(404).json({ message: 'Receta no encontrada o sin permisos' });
      return;
    }

    const { title, image, ingredients, preparation, groupIds } = req.body;

    if (title) recipe.title = title.trim();
    if (image !== undefined) {
      if (image.length > MAX_IMAGE_SIZE) {
        res.status(400).json({ message: 'La imagen es demasiado grande' });
        return;
      }
      recipe.image = image;
    }
    if (ingredients) recipe.ingredients = normalizeIngredients(ingredients);
    if (preparation !== undefined) recipe.preparation = preparation.trim();

    if (groupIds !== undefined) {
      recipe.groups = await validateGroupIds(groupIds, req.userId!);
    }

    await recipe.save();
    const populated = await Recipe.findById(recipe._id).populate(populateOptions);

    res.json({ message: 'Receta actualizada', recipe: populated });
  } catch (error) {
    if (error instanceof Error && error.message.includes('grupos')) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Error al actualizar receta', error });
  }
};

export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!recipe) {
      res.status(403).json({
        message: 'No tienes permiso para eliminar esta receta. Solo el creador puede hacerlo.',
      });
      return;
    }

    await SavedRecipe.deleteMany({ recipe: recipe._id });
    await Rating.deleteMany({ recipe: recipe._id });
    await Recipe.findByIdAndDelete(recipe._id);

    res.json({ message: 'Receta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar receta', error });
  }
};

function normalizeIngredients(ingredients: unknown): IIngredient[] {
  if (!Array.isArray(ingredients)) return [];

  return ingredients
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item.trim(), quantity: '', unit: 'unidad' };
      }
      if (item && typeof item === 'object' && 'name' in item) {
        const ing = item as IIngredient;
        return {
          name: (ing.name || '').trim(),
          quantity: (ing.quantity || '').trim(),
          unit: (ing.unit || 'unidad').trim(),
        };
      }
      return null;
    })
    .filter((item): item is IIngredient => !!item?.name);
}

async function validateGroupIds(
  groupIds: string[] | undefined,
  userId: Types.ObjectId
): Promise<Types.ObjectId[]> {
  if (!groupIds || groupIds.length === 0) return [];

  const groups = await Group.find({
    _id: { $in: groupIds },
    user: userId,
  });

  if (groups.length !== groupIds.length) {
    throw new Error('Uno o más grupos no existen o no te pertenecen');
  }

  return groups.map((g) => g._id);
}
