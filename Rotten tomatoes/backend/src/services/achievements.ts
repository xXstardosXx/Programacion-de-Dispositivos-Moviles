import { prisma } from '../config/db';
import {
  AchievementCode,
  AchievementDef,
  ACHIEVEMENTS,
  getAchievement,
} from '../utils/achievements';

const asCodes = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string');
};

/** Desbloquea logros nuevos y devuelve solo los que se acaban de ganar. */
export const unlockAchievements = async (
  userId: string,
  codes: AchievementCode[]
): Promise<AchievementDef[]> => {
  if (codes.length === 0) return [];

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const current = asCodes(user.achievements);
  const fresh = codes.filter((c) => !current.includes(c));
  if (fresh.length === 0) return [];

  await prisma.user.update({
    where: { id: userId },
    data: { achievements: [...current, ...fresh] },
  });

  return fresh
    .map((c) => getAchievement(c))
    .filter((a): a is AchievementDef => Boolean(a));
};

export const evaluateReviewAchievements = async (
  userId: string,
  score: number,
  content: string
): Promise<AchievementDef[]> => {
  const toUnlock: AchievementCode[] = [];

  const reviewCount = await prisma.review.count({ where: { userId } });
  if (reviewCount === 1) toUnlock.push('first_blood');
  if (score === 10) toUnlock.push('perfect_ten');
  if (score === 1) toUnlock.push('trash_talk');
  if (content.trim().length >= 200) toUnlock.push('wall_of_text');

  return unlockAchievements(userId, toUnlock);
};

export const listAllAchievements = () => ACHIEVEMENTS;
