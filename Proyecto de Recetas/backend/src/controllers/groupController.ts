import { Request, Response } from 'express';
import { Group } from '../models/Group';
import { Recipe } from '../models/Recipe';
import { SavedRecipe } from '../models/SavedRecipe';
import { Types } from 'mongoose';

const populateOptions = [
  { path: 'groups', select: 'name color' },
  { path: 'user', select: 'name email avatar' },
];

export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const groups = await Group.find({ user: req.userId }).sort({ name: 1 });

    const groupsWithCount = await Promise.all(
      groups.map(async (group) => {
        const ownedCount = await Recipe.countDocuments({
          user: req.userId,
          groups: group._id,
        });
        const savedCount = await SavedRecipe.countDocuments({
          user: req.userId,
          group: group._id,
        });
        return {
          ...group.toJSON(),
          recipeCount: ownedCount + savedCount,
        };
      })
    );

    res.json(groupsWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupos', error });
  }
};

export const getGroupById = async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await Group.findOne({ _id: req.params.id, user: req.userId });
    if (!group) {
      res.status(404).json({ message: 'Grupo no encontrado' });
      return;
    }

    const ownedRecipes = await Recipe.find({
      user: req.userId,
      groups: group._id,
    }).populate(populateOptions);

    const savedLinks = await SavedRecipe.find({
      user: req.userId,
      group: group._id,
    }).select('recipe');

    const savedIds = savedLinks.map((s) => s.recipe);
    const savedRecipes = await Recipe.find({
      _id: { $in: savedIds },
      user: { $ne: req.userId },
    }).populate(populateOptions);

    const allRecipes = [...ownedRecipes, ...savedRecipes].sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    res.json({ group, recipes: allRecipes });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupo', error });
  }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ message: 'El nombre del grupo es obligatorio' });
      return;
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#E07A5F',
      user: req.userId,
    });

    res.status(201).json({ message: 'Grupo creado', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear grupo', error });
  }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, color } = req.body;
    const group = await Group.findOne({ _id: req.params.id, user: req.userId });

    if (!group) {
      res.status(404).json({ message: 'Grupo no encontrado' });
      return;
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (color) group.color = color;

    await group.save();
    res.json({ message: 'Grupo actualizado', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar grupo', error });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await Group.findOne({ _id: req.params.id, user: req.userId });

    if (!group) {
      res.status(404).json({ message: 'Grupo no encontrado' });
      return;
    }

    const savedCount = await SavedRecipe.countDocuments({ group: group._id });

    await SavedRecipe.deleteMany({ group: group._id });

    await Recipe.updateMany(
      { user: req.userId, groups: group._id },
      { $pull: { groups: group._id } }
    );

    await Group.findByIdAndDelete(group._id);

    res.json({
      message: 'Grupo eliminado',
      removedSavedCount: savedCount,
      warning:
        savedCount > 0
          ? `Se quitaron ${savedCount} receta(s) guardada(s) de este grupo. Las recetas siguen existiendo.`
          : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar grupo', error });
  }
};

export const saveRecipeToGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = String(req.params.groupId);
    const recipeId = String(req.params.recipeId);

    const group = await Group.findOne({ _id: groupId, user: req.userId });
    if (!group) {
      res.status(404).json({ message: 'Grupo no encontrado' });
      return;
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ message: 'Receta no encontrada' });
      return;
    }

    const isOwner = recipe.user.toString() === req.userId!.toString();

    if (isOwner) {
      if (!recipe.groups.some((g) => g.toString() === groupId)) {
        recipe.groups.push(new Types.ObjectId(groupId));
        await recipe.save();
      }
    } else {
      const exists = await SavedRecipe.findOne({
        user: req.userId,
        recipe: recipeId,
        group: groupId,
      });
      if (exists) {
        res.status(409).json({ message: 'La receta ya está en este grupo' });
        return;
      }
      await SavedRecipe.create({
        user: req.userId,
        recipe: recipeId,
        group: groupId,
      });
    }

    res.status(201).json({ message: 'Receta guardada en el grupo' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar receta en grupo', error });
  }
};

export const removeRecipeFromGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const groupId = String(req.params.groupId);
    const recipeId = String(req.params.recipeId);

    const group = await Group.findOne({ _id: groupId, user: req.userId });
    if (!group) {
      res.status(404).json({ message: 'Grupo no encontrado' });
      return;
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ message: 'Receta no encontrada' });
      return;
    }

    const isOwner = recipe.user.toString() === req.userId!.toString();

    if (isOwner) {
      recipe.groups = recipe.groups.filter((g) => g.toString() !== groupId);
      await recipe.save();
    } else {
      await SavedRecipe.findOneAndDelete({
        user: req.userId,
        recipe: recipeId,
        group: groupId,
      });
    }

    res.json({
      message: 'Receta quitada del grupo (la receta sigue existiendo)',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al quitar receta del grupo', error });
  }
};

export const getSavedGroupsForRecipe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const recipeId = String(req.params.recipeId);

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ message: 'Receta no encontrada' });
      return;
    }

    const isOwner = recipe.user.toString() === req.userId!.toString();
    const groupIds: string[] = [];

    if (isOwner) {
      groupIds.push(...recipe.groups.map((g) => g.toString()));
    }

    const saved = await SavedRecipe.find({
      user: req.userId,
      recipe: recipeId,
    }).select('group');

    groupIds.push(...saved.map((s) => s.group.toString()));

    res.json({ groupIds: [...new Set(groupIds)] });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupos de la receta', error });
  }
};
