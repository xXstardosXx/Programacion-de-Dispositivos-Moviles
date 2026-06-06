import { Types } from 'mongoose';
import { Rating } from '../models/Rating';

export interface RatingStats {
  averageRating: number;
  ratingCount: number;
  userRating?: number | null;
}

export async function getRatingStatsForRecipe(
  recipeId: Types.ObjectId | string,
  userId?: Types.ObjectId
): Promise<RatingStats> {
  const id = new Types.ObjectId(recipeId);

  const [agg] = await Rating.aggregate([
    { $match: { recipe: id } },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$score' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  let userRating: number | null = null;
  if (userId) {
    const userRate = await Rating.findOne({ user: userId, recipe: id });
    userRating = userRate?.score ?? null;
  }

  return {
    averageRating: agg ? Math.round(agg.averageRating * 10) / 10 : 0,
    ratingCount: agg?.ratingCount ?? 0,
    userRating,
  };
}

export async function attachRatingsToRecipes<T extends { _id: Types.ObjectId }>(
  recipes: T[],
  userId?: Types.ObjectId
): Promise<(T & RatingStats)[]> {
  if (recipes.length === 0) return [];

  const ids = recipes.map((r) => r._id);

  const aggregates = await Rating.aggregate([
    { $match: { recipe: { $in: ids } } },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$score' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const statsMap = new Map(
    aggregates.map((a) => [
      a._id.toString(),
      {
        averageRating: Math.round(a.averageRating * 10) / 10,
        ratingCount: a.ratingCount,
      },
    ])
  );

  let userRatingsMap = new Map<string, number>();
  if (userId) {
    const userRates = await Rating.find({ user: userId, recipe: { $in: ids } });
    userRatingsMap = new Map(
      userRates.map((r) => [r.recipe.toString(), r.score])
    );
  }

  return recipes.map((recipe) => {
    const key = recipe._id.toString();
    const stats = statsMap.get(key);
    return {
      ...recipe,
      averageRating: stats?.averageRating ?? 0,
      ratingCount: stats?.ratingCount ?? 0,
      userRating: userId ? (userRatingsMap.get(key) ?? null) : undefined,
    };
  });
}
