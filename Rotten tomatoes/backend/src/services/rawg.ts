import { isGameSafe } from '../utils/contentFilter';

const RAWG_BASE = 'https://api.rawg.io/api';

export interface RawgPreview {
  rawgId: number;
  title: string;
  slug: string | null;
  overview: string;
  releaseDate: string | null;
  coverUrl: string | null;
  metacritic: number | null;
  rawgRating: number | null;
  esrbRating: string | null;
  /** Nombres de género listos para UI */
  genres: string[];
}

export interface RawgDetail extends Omit<RawgPreview, 'genres'> {
  backgroundUrl: string | null;
  playtime: number | null;
  platforms: { id: number; name: string }[];
  developers: { id: number; name: string }[];
  genres: { id: number; name: string }[];
}

export const isRawgConfigured = (): boolean => Boolean(process.env.RAWG_API_KEY);

const buildUrl = (path: string, params: Record<string, string> = {}) => {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error('RAWG no está configurado (falta RAWG_API_KEY)');

  const url = new URL(`${RAWG_BASE}${path}`);
  url.searchParams.set('key', key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
};

const rawgFetch = async <T>(path: string, params?: Record<string, string>): Promise<T> => {
  const url = buildUrl(path, params);
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`RAWG respondió ${res.status}`);
  }
  return (await res.json()) as T;
};

const mapPreview = (g: any): RawgPreview => ({
  rawgId: g.id,
  title: g.name || 'Sin título',
  slug: g.slug || null,
  overview: '',
  releaseDate: g.released || null,
  coverUrl: g.background_image || null,
  metacritic: typeof g.metacritic === 'number' ? g.metacritic : null,
  rawgRating: typeof g.rating === 'number' ? g.rating : null,
  esrbRating: g.esrb_rating?.name || null,
  genres: (g.genres || [])
    .map((x: any) => (typeof x?.name === 'string' ? x.name : ''))
    .filter(Boolean),
});

/**
 * Búsqueda en RAWG. Devuelve solo juegos limpios (sin AO / NSFW / sexual).
 * NO guarda nada: el cacheo ocurre al importar un juego concreto.
 */
export const searchRawg = async (query: string): Promise<RawgPreview[]> => {
  const data = await rawgFetch<{ results: any[] }>('/games', {
    search: query,
    page_size: '40',
    search_precise: 'false',
  });

  return (data.results || [])
    .filter((g) => isGameSafe(g))
    .slice(0, 20)
    .map(mapPreview);
};

/**
 * Detalle completo. Si el juego no es seguro, lanza error (no se cachea).
 */
export const getRawgDetail = async (rawgId: number): Promise<RawgDetail> => {
  const data = await rawgFetch<any>(`/games/${rawgId}`);

  if (!isGameSafe(data)) {
    throw new Error('BLOCKED_CONTENT');
  }

  const platforms = (data.platforms || [])
    .map((p: any) => ({
      id: p.platform?.id,
      name: p.platform?.name,
    }))
    .filter((p: any) => p.id && p.name);

  const developers = (data.developers || []).map((d: any) => ({
    id: d.id,
    name: d.name,
  }));

  return {
    ...mapPreview(data),
    overview: data.description_raw || data.description || '',
    backgroundUrl: data.background_image_additional || data.background_image || null,
    playtime: typeof data.playtime === 'number' ? data.playtime : null,
    platforms,
    developers,
    genres: (data.genres || []).map((x: any) => ({ id: x.id, name: x.name })),
  };
};

/** Catálogo popular limpio (opcionalmente filtrado por género RAWG). */
export const getPopularRawg = async (genreId?: number): Promise<RawgPreview[]> => {
  const params: Record<string, string> = {
    page_size: '40',
    ordering: '-metacritic',
    dates: '2015-01-01,2030-12-31',
  };
  if (genreId && Number.isFinite(genreId) && genreId > 0) {
    params.genres = String(genreId);
  }

  const data = await rawgFetch<{ results: any[] }>('/games', params);

  return (data.results || [])
    .filter((g) => isGameSafe(g))
    .slice(0, 20)
    .map(mapPreview);
};

/** Capturas de pantalla del juego (solo URLs CDN). */
export const getRawgScreenshots = async (rawgId: number): Promise<string[]> => {
  try {
    const data = await rawgFetch<{ results: { image?: string }[] }>(
      `/games/${rawgId}/screenshots`,
      { page_size: '8' }
    );
    return (data.results || [])
      .map((r) => r.image)
      .filter((url): url is string => Boolean(url))
      .slice(0, 8);
  } catch {
    return [];
  }
};
