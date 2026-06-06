import { Ingredient, Recipe, User } from '../types';

export const normalizeIngredients = (
  ingredients: Ingredient[] | string[] | undefined
): Ingredient[] => {
  if (!ingredients?.length) return [];

  return ingredients.map((item) => {
    if (typeof item === 'string') {
      return { name: item, quantity: '', unit: 'unidad' };
    }
    return {
      name: item.name || '',
      quantity: item.quantity || '',
      unit: item.unit || 'unidad',
    };
  });
};

export const formatIngredient = (ing: Ingredient): string => {
  const parts = [ing.name];
  if (ing.quantity) parts.push(ing.quantity);
  if (ing.unit && ing.unit !== 'unidad') parts.push(ing.unit);
  return parts.join(' - ');
};

export const getPreparationText = (recipe: Recipe): string => {
  if (recipe.preparation?.trim()) return recipe.preparation;
  if (recipe.steps?.length) return recipe.steps.join('\n');
  return '';
};

export const getIngredientCount = (recipe: Recipe): number =>
  normalizeIngredients(recipe.ingredients).filter((i) => i.name.trim()).length;

export const getRecipeOwnerId = (recipe: Recipe): string => {
  const user = recipe.user;
  if (typeof user === 'object' && user !== null) {
    return String((user as User)._id);
  }
  return String(user);
};

export const isRecipeOwner = (recipe: Recipe, userId?: string): boolean => {
  if (!userId) return false;
  return getRecipeOwnerId(recipe) === String(userId);
};

export type SortOption =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'date-new'
  | 'date-old'
  | 'rating-high'
  | 'rating-low';

export const sortRecipes = (recipes: Recipe[], sort: SortOption): Recipe[] => {
  const sorted = [...recipes];
  switch (sort) {
    case 'alpha-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'date-new':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'date-old':
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'rating-high':
      return sorted.sort(
        (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)
      );
    case 'rating-low':
      return sorted.sort(
        (a, b) => (a.averageRating ?? 0) - (b.averageRating ?? 0)
      );
    default:
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
};

export const filterRecipes = (
  recipes: Recipe[],
  search: string,
  groupId: string | null
): Recipe[] => {
  let result = recipes;

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((r) => r.title.toLowerCase().includes(q));
  }

  if (groupId) {
    result = result.filter((r) =>
      r.groups?.some((g) => g._id === groupId)
    );
  }

  return result;
};

export const extractFilterGroups = (recipes: Recipe[]) => {
  const map = new Map<string, { _id: string; name: string; color: string }>();
  recipes.forEach((r) => {
    r.groups?.forEach((g) => {
      if (!map.has(g._id)) map.set(g._id, { _id: g._id, name: g.name, color: g.color });
    });
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};
