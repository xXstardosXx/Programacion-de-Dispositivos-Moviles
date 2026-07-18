import { Game } from '@prisma/client';
import { prisma } from '../config/db';
import { getRawgDetail } from './rawg';

/**
 * Upsert / caché local.
 * 1) Busca por rawgId en Neon.
 * 2) Si no existe → trae de RAWG, valida contenido limpio, guarda SOLO metadatos + URLs de imagen.
 *    (Las imágenes no se descargan ni se guardan en binario; solo la URL del CDN de RAWG.)
 */
export const importAndCacheGame = async (rawgId: number): Promise<Game> => {
  const existing = await prisma.game.findUnique({ where: { rawgId } });
  if (existing) return existing;

  const detail = await getRawgDetail(rawgId);

  for (const genre of detail.genres) {
    await prisma.genre.upsert({
      where: { id: genre.id },
      update: { name: genre.name },
      create: { id: genre.id, name: genre.name },
    });
  }

  const releaseDate = detail.releaseDate ? new Date(detail.releaseDate) : null;

  return prisma.game.upsert({
    where: { rawgId },
    update: {},
    create: {
      rawgId: detail.rawgId,
      title: detail.title,
      slug: detail.slug,
      overview: detail.overview.slice(0, 8000),
      releaseDate: releaseDate && !isNaN(releaseDate.getTime()) ? releaseDate : null,
      coverUrl: detail.coverUrl,
      backgroundUrl: detail.backgroundUrl,
      metacritic: detail.metacritic,
      rawgRating: detail.rawgRating,
      playtime: detail.playtime,
      platforms: detail.platforms,
      developers: detail.developers,
      esrbRating: detail.esrbRating,
      genres: {
        connect: detail.genres.map((g) => ({ id: g.id })),
      },
    },
  });
};
