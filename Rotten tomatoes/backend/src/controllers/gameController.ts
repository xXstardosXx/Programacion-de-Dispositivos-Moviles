import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import {
  searchRawg,
  isRawgConfigured,
  getPopularRawg,
  getRawgScreenshots,
} from '../services/rawg';
import { importAndCacheGame } from '../services/gameCache';
import {
  getScoresForGame,
  getScoresForGames,
  emptyScore,
  DualScore,
} from '../utils/scores';
import { cleanSingleLine } from '../utils/sanitize';
import { LIMITS } from '../utils/validators';
import { getUnsafeReason } from '../utils/contentFilter';

const genreInclude = Prisma.validator<Prisma.GameInclude>()({
  genres: { select: { id: true, name: true } },
});

type GameWithGenres = Prisma.GameGetPayload<{ include: typeof genreInclude }>;

/** Convierte strings o { name } a una lista limpia de nombres. */
const toNameList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'name' in item) {
        const name = (item as { name?: unknown }).name;
        return typeof name === 'string' ? name.trim() : '';
      }
      return '';
    })
    .filter(Boolean);
};

const serializeGame = (game: GameWithGenres, scores: DualScore) => ({
  id: game.id,
  rawgId: game.rawgId,
  title: game.title,
  slug: game.slug,
  overview: game.overview,
  releaseDate: game.releaseDate,
  coverUrl: game.coverUrl,
  backgroundUrl: game.backgroundUrl,
  metacritic: game.metacritic,
  rawgRating: game.rawgRating,
  playtime: game.playtime,
  platforms: toNameList(game.platforms),
  developers: toNameList(game.developers),
  esrbRating: game.esrbRating,
  genres: toNameList(game.genres),
  ...scores,
});

const hiddenGameIdsForUser = async (userId?: string): Promise<string[]> => {
  if (!userId) return [];
  const rows = await prisma.hiddenGame.findMany({
    where: { userId },
    select: { gameId: true },
  });
  return rows.map((r) => r.gameId);
};

/**
 * Catálogo local con filtros y sorting limpios.
 * Si el usuario está logueado, omite juegos que ocultó de su catálogo.
 */
export const getCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = cleanSingleLine(req.query.q, LIMITS.searchQuery);
    const genreId = req.query.genreId ? Number(req.query.genreId) : undefined;
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const sort = String(req.query.sort || 'score_desc');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const hiddenIds = await hiddenGameIdsForUser(req.userId);
    const where: Prisma.GameWhereInput = {};
    if (hiddenIds.length) where.id = { notIn: hiddenIds };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (genreId && Number.isFinite(genreId)) {
      where.genres = { some: { id: genreId } };
    }
    if ((from && !isNaN(from.getTime())) || (to && !isNaN(to.getTime()))) {
      where.releaseDate = {};
      if (from && !isNaN(from.getTime())) where.releaseDate.gte = from;
      if (to && !isNaN(to.getTime())) where.releaseDate.lte = to;
    }

    if (sort === 'date_asc' || sort === 'date_desc' || sort === 'title_asc' || sort === 'title_desc') {
      const orderBy: Prisma.GameOrderByWithRelationInput =
        sort === 'date_asc'
          ? { releaseDate: 'asc' }
          : sort === 'date_desc'
          ? { releaseDate: 'desc' }
          : sort === 'title_asc'
          ? { title: 'asc' }
          : { title: 'desc' };

      const [total, games] = await Promise.all([
        prisma.game.count({ where }),
        prisma.game.findMany({
          where,
          include: genreInclude,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const scoreMap = await getScoresForGames(games.map((g) => g.id));
      res.json({
        page,
        limit,
        total,
        results: games.map((g) => serializeGame(g, scoreMap.get(g.id) ?? emptyScore())),
      });
      return;
    }

    const filtered = await prisma.game.findMany({
      where,
      include: genreInclude,
      take: 500,
    });
    const scoreMap = await getScoresForGames(filtered.map((g) => g.id));

    const overall = (s: DualScore): number => {
      const total = s.audienceCount + s.criticCount;
      if (total === 0) return -1;
      return (s.audienceScore * s.audienceCount + s.criticScore * s.criticCount) / total;
    };

    const ranked = filtered
      .map((g) => ({ game: g, scores: scoreMap.get(g.id) ?? emptyScore() }))
      .sort((a, b) => overall(b.scores) - overall(a.scores));

    const total = ranked.length;
    const pageItems = ranked.slice((page - 1) * limit, (page - 1) * limit + limit);

    res.json({
      page,
      limit,
      total,
      results: pageItems.map((x) => serializeGame(x.game, x.scores)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el catálogo', error: String(error) });
  }
};

/** Promedio simple entre Audience y Critic (solo lados con reseñas). */
const dualAverage = (s: DualScore): number => {
  const parts: number[] = [];
  if (s.audienceCount > 0) parts.push(s.audienceScore);
  if (s.criticCount > 0) parts.push(s.criticScore);
  if (parts.length === 0) return -1;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
};

/**
 * Catálogo personal: solo juegos que el usuario ha reseñado.
 */
export const getMyCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const genreId = req.query.genreId ? Number(req.query.genreId) : undefined;
    const sort = String(req.query.sort || 'score_desc');
    const hiddenIds = await hiddenGameIdsForUser(req.userId);

    const where: Prisma.GameWhereInput = {
      reviews: { some: { userId: req.userId } },
    };
    if (hiddenIds.length) where.id = { notIn: hiddenIds };
    if (genreId && Number.isFinite(genreId)) {
      where.genres = { some: { id: genreId } };
    }

    const games = await prisma.game.findMany({
      where,
      include: genreInclude,
      take: 200,
    });
    const scoreMap = await getScoresForGames(games.map((g) => g.id));

    let ranked = games.map((g) => ({
      game: g,
      scores: scoreMap.get(g.id) ?? emptyScore(),
    }));

    if (sort === 'title_asc') {
      ranked.sort((a, b) => a.game.title.localeCompare(b.game.title));
    } else if (sort === 'title_desc') {
      ranked.sort((a, b) => b.game.title.localeCompare(a.game.title));
    } else if (sort === 'date_asc') {
      ranked.sort(
        (a, b) =>
          (a.game.releaseDate?.getTime() ?? 0) - (b.game.releaseDate?.getTime() ?? 0)
      );
    } else if (sort === 'date_desc') {
      ranked.sort(
        (a, b) =>
          (b.game.releaseDate?.getTime() ?? 0) - (a.game.releaseDate?.getTime() ?? 0)
      );
    } else {
      ranked.sort((a, b) => dualAverage(b.scores) - dualAverage(a.scores));
    }

    res.json({
      results: ranked.map((x) => serializeGame(x.game, x.scores)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tu catálogo', error: String(error) });
  }
};

/**
 * Tendencia: juegos con reseñas, ordenados por promedio audiencia/críticos
 * y actividad reciente.
 */
export const getTrending = async (req: Request, res: Response): Promise<void> => {
  try {
    const genreId = req.query.genreId ? Number(req.query.genreId) : undefined;
    const hiddenIds = await hiddenGameIdsForUser(req.userId);

    const where: Prisma.GameWhereInput = {
      reviews: { some: {} },
    };
    if (hiddenIds.length) where.id = { notIn: hiddenIds };
    if (genreId && Number.isFinite(genreId)) {
      where.genres = { some: { id: genreId } };
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        ...genreInclude,
        reviews: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { reviews: true } },
      },
      take: 200,
    });

    const scoreMap = await getScoresForGames(games.map((g) => g.id));

    const ranked = games
      .map((g) => {
        const scores = scoreMap.get(g.id) ?? emptyScore();
        return {
          game: g,
          scores,
          avg: dualAverage(scores),
          lastReviewAt: g.reviews[0]?.createdAt?.getTime() ?? 0,
          reviewCount: g._count.reviews,
        };
      })
      .sort((a, b) => {
        if (b.avg !== a.avg) return b.avg - a.avg;
        if (b.lastReviewAt !== a.lastReviewAt) return b.lastReviewAt - a.lastReviewAt;
        return b.reviewCount - a.reviewCount;
      });

    res.json({
      results: ranked.map((x) => serializeGame(x.game, x.scores)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tendencias', error: String(error) });
  }
};

/**
 * Búsqueda: primero local (Neon), luego externos (sin etiquetar la fuente).
 */
export const searchGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = cleanSingleLine(req.query.q, LIMITS.searchQuery);
    if (!q || q.length < 2) {
      res.json({ query: q, local: [], external: [] });
      return;
    }

    const hiddenIds = await hiddenGameIdsForUser(req.userId);
    const localWhere: Prisma.GameWhereInput = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (hiddenIds.length) localWhere.id = { notIn: hiddenIds };

    const localGames = await prisma.game.findMany({
      where: localWhere,
      include: genreInclude,
      take: 20,
    });

    const scoreMap = await getScoresForGames(localGames.map((g) => g.id));
    const local = localGames.map((g) => serializeGame(g, scoreMap.get(g.id) ?? emptyScore()));
    const localRawgIds = new Set(localGames.map((g) => g.rawgId));

    // También excluir de externos los que el usuario ocultó (siguen en Neon).
    if (hiddenIds.length) {
      const hiddenGames = await prisma.game.findMany({
        where: { id: { in: hiddenIds } },
        select: { rawgId: true },
      });
      for (const g of hiddenGames) localRawgIds.add(g.rawgId);
    }

    let external: unknown[] = [];
    if (isRawgConfigured()) {
      try {
        const rawgResults = await searchRawg(q);
        external = rawgResults.filter((r) => !localRawgIds.has(r.rawgId));
      } catch (err) {
        console.warn('Búsqueda externa falló:', String(err));
      }
    }

    res.json({ query: q, local, external });
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar', error: String(error) });
  }
};

export const importGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawgId = Number(req.body.rawgId);

    if (!Number.isFinite(rawgId) || rawgId <= 0) {
      res.status(400).json({ message: 'rawgId inválido' });
      return;
    }
    if (!isRawgConfigured()) {
      res.status(503).json({ message: 'Catálogo externo no configurado en el servidor' });
      return;
    }

    try {
      await importAndCacheGame(rawgId);
    } catch (err) {
      if (String(err).includes('BLOCKED_CONTENT')) {
        res.status(403).json({ message: getUnsafeReason() });
        return;
      }
      throw err;
    }

    // Si estaba oculto, al "abrirlo" de nuevo lo restauramos al catálogo del usuario.
    const game = await prisma.game.findUnique({
      where: { rawgId },
      include: genreInclude,
    });
    if (!game) {
      res.status(404).json({ message: 'No se pudo abrir el juego' });
      return;
    }

    if (req.userId) {
      await prisma.hiddenGame.deleteMany({
        where: { userId: req.userId, gameId: game.id },
      });
    }

    const scores = await getScoresForGame(game.id);
    res.status(201).json(serializeGame(game, scores));
  } catch (error) {
    res.status(502).json({ message: 'Error al abrir el juego', error: String(error) });
  }
};

export const getGameDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const game = await prisma.game.findUnique({
      where: { id },
      include: genreInclude,
    });
    if (!game) {
      res.status(404).json({ message: 'Juego no encontrado' });
      return;
    }

    const scores = await getScoresForGame(game.id);

    const [totalReviews, reviews, screenshots] = await Promise.all([
      prisma.review.count({ where: { gameId: game.id } }),
      prisma.review.findMany({
        where: { gameId: game.id },
        include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      isRawgConfigured() ? getRawgScreenshots(game.rawgId) : Promise.resolve([] as string[]),
    ]);

    let myReview = null;
    let isHidden = false;
    if (req.userId) {
      const [review, hidden] = await Promise.all([
        prisma.review.findUnique({
          where: { userId_gameId: { userId: req.userId, gameId: game.id } },
        }),
        prisma.hiddenGame.findUnique({
          where: { userId_gameId: { userId: req.userId, gameId: game.id } },
        }),
      ]);
      myReview = review;
      isHidden = Boolean(hidden);
    }

    res.json({
      ...serializeGame(game, scores),
      screenshots,
      isHidden,
      myReview,
      reviews: {
        page,
        limit,
        total: totalReviews,
        hasMore: page * limit < totalReviews,
        items: reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el juego', error: String(error) });
  }
};

export const hideGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = String(req.params.id);
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      res.status(404).json({ message: 'Juego no encontrado' });
      return;
    }

    await prisma.hiddenGame.upsert({
      where: { userId_gameId: { userId: req.userId!, gameId } },
      create: { userId: req.userId!, gameId },
      update: {},
    });

    res.json({ message: 'Juego quitado de tu catálogo', isHidden: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al ocultar el juego', error: String(error) });
  }
};

export const unhideGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = String(req.params.id);
    await prisma.hiddenGame.deleteMany({
      where: { userId: req.userId!, gameId },
    });
    res.json({ message: 'Juego restaurado en tu catálogo', isHidden: false });
  } catch (error) {
    res.status(500).json({ message: 'Error al restaurar el juego', error: String(error) });
  }
};

export const getGenres = async (_req: Request, res: Response): Promise<void> => {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener géneros', error: String(error) });
  }
};

/** Sugerencias externas; acepta ?genreId= para filtrar por género. */
export const getDiscover = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isRawgConfigured()) {
      res.json([]);
      return;
    }
    const genreId = req.query.genreId ? Number(req.query.genreId) : undefined;
    const results = await getPopularRawg(
      genreId && Number.isFinite(genreId) ? genreId : undefined
    );
    res.json(results);
  } catch (error) {
    res.status(502).json({ message: 'Error al descubrir juegos', error: String(error) });
  }
};
