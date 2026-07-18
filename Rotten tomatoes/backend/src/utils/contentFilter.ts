/**
 * Filtro de contenido limpio.
 * Bloquea juegos +18 / sexuales / NSFW antes de listarlos o cachearlos.
 */

const BLOCKED_ESRB_SLUGS = new Set(['adults-only', 'ao']);

/** Frases / slugs largos: basta con que aparezcan como substring. */
const BLOCKED_PHRASES = [
  'adults only',
  'adults-only',
  'sexual content',
  'sexual-content',
  'sex game',
  'sex-game',
  'hentai',
  'erotica',
  'erotic',
  'pornography',
  'uncensored',
  'nsfw',
];

/** Palabras cortas: solo coincidencia de palabra completa (evita "sex" en "Sussex"). */
const BLOCKED_WORDS = [
  'nsfw',
  'adult',
  'hentai',
  'porn',
  'porno',
  'erotic',
  'erotica',
  'sexual',
  'nude',
  'nudity',
  'naked',
  'lewd',
  'ecchi',
  'fetish',
  'smut',
  'xxx',
];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasBlockedContent = (text: string): boolean => {
  const n = normalize(text);
  if (!n) return false;

  if (n.includes('18+') || n.includes('+18') || n.includes('+21')) return true;

  for (const phrase of BLOCKED_PHRASES) {
    if (n.includes(normalize(phrase))) return true;
  }

  const tokens = new Set(n.split(' '));
  for (const word of BLOCKED_WORDS) {
    if (tokens.has(word)) return true;
  }

  return false;
};

export interface RawgLikeForFilter {
  name?: string | null;
  slug?: string | null;
  esrb_rating?: { id?: number; slug?: string; name?: string } | null;
  tags?: { id?: number; slug?: string; name?: string }[] | null;
  genres?: { id?: number; slug?: string; name?: string }[] | null;
}

export const isGameSafe = (game: RawgLikeForFilter): boolean => {
  const esrbSlug = (game.esrb_rating?.slug || '').toLowerCase();
  if (BLOCKED_ESRB_SLUGS.has(esrbSlug)) return false;

  if (game.esrb_rating?.name && hasBlockedContent(game.esrb_rating.name)) return false;
  if (game.name && hasBlockedContent(game.name)) return false;
  if (game.slug && hasBlockedContent(game.slug)) return false;

  for (const tag of game.tags || []) {
    if (tag.slug && hasBlockedContent(tag.slug)) return false;
    if (tag.name && hasBlockedContent(tag.name)) return false;
  }

  for (const genre of game.genres || []) {
    if (genre.slug && hasBlockedContent(genre.slug)) return false;
    if (genre.name && hasBlockedContent(genre.name)) return false;
  }

  return true;
};

export const getUnsafeReason = (): string =>
  'Este juego no se puede mostrar: contenido adulto o sexual bloqueado.';
