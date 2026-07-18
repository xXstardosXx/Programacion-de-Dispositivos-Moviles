import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';

export interface DualScore {
  audienceScore: number;
  audienceCount: number;
  criticScore: number;
  criticCount: number;
}

interface RawScoreRow {
  audience_score: number | null;
  audience_count: bigint;
  critic_score: number | null;
  critic_count: bigint;
}

const round1 = (n: number | null): number =>
  n === null ? 0 : Math.round(n * 10) / 10;

export const emptyScore = (): DualScore => ({
  audienceScore: 0,
  audienceCount: 0,
  criticScore: 0,
  criticCount: 0,
});

/**
 * Doble puntuación en una sola query (Audience vs Critic).
 */
export const getScoresForGame = async (gameId: string): Promise<DualScore> => {
  const rows = await prisma.$queryRaw<RawScoreRow[]>`
    SELECT
      AVG(r."score") FILTER (WHERE u."role" = 'USER')   AS audience_score,
      COUNT(*)       FILTER (WHERE u."role" = 'USER')   AS audience_count,
      AVG(r."score") FILTER (WHERE u."role" = 'CRITIC') AS critic_score,
      COUNT(*)       FILTER (WHERE u."role" = 'CRITIC') AS critic_count
    FROM "Review" r
    JOIN "User" u ON u."id" = r."userId"
    WHERE r."gameId" = ${gameId}
  `;

  const row = rows[0];
  return {
    audienceScore: round1(row?.audience_score ?? null),
    audienceCount: Number(row?.audience_count ?? 0),
    criticScore: round1(row?.critic_score ?? null),
    criticCount: Number(row?.critic_count ?? 0),
  };
};

export const getScoresForGames = async (
  gameIds: string[]
): Promise<Map<string, DualScore>> => {
  const result = new Map<string, DualScore>();
  if (gameIds.length === 0) return result;

  const rows = await prisma.$queryRaw<(RawScoreRow & { game_id: string })[]>`
    SELECT
      r."gameId" AS game_id,
      AVG(r."score") FILTER (WHERE u."role" = 'USER')   AS audience_score,
      COUNT(*)       FILTER (WHERE u."role" = 'USER')   AS audience_count,
      AVG(r."score") FILTER (WHERE u."role" = 'CRITIC') AS critic_score,
      COUNT(*)       FILTER (WHERE u."role" = 'CRITIC') AS critic_count
    FROM "Review" r
    JOIN "User" u ON u."id" = r."userId"
    WHERE r."gameId" IN (${Prisma.join(gameIds)})
    GROUP BY r."gameId"
  `;

  for (const row of rows) {
    result.set(row.game_id, {
      audienceScore: round1(row.audience_score),
      audienceCount: Number(row.audience_count ?? 0),
      criticScore: round1(row.critic_score),
      criticCount: Number(row.critic_count ?? 0),
    });
  }

  return result;
};
