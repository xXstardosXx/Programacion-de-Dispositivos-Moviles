export type Role = 'USER' | 'CRITIC';

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  achievements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Platform {
  id: number;
  name: string;
}

export interface Developer {
  id: number;
  name: string;
}

export interface Game {
  id: string;
  rawgId: number;
  title: string;
  slug?: string;
  overview: string;
  releaseDate: string | null;
  coverUrl: string | null;
  backgroundUrl: string | null;
  metacritic: number | null;
  rawgRating: number | null;
  playtime: number | null;
  platforms: string[];
  developers: string[];
  esrbRating: string | null;
  genres: string[];
  audienceScore: number;
  audienceCount: number;
  criticScore: number;
  criticCount: number;
}

export interface RawgPreview {
  rawgId: number;
  title: string;
  slug: string;
  overview: string;
  releaseDate: string | null;
  coverUrl: string | null;
  metacritic: number | null;
  rawgRating: number | null;
  esrbRating: string | null;
  genres: string[];
}

export interface ReviewUser {
  id: string;
  name: string;
  role: Role;
  avatar?: string | null;
}

export interface Review {
  id: string;
  score: number;
  content: string;
  userId: string;
  gameId: string;
  user?: ReviewUser;
  createdAt: string;
  updatedAt: string;
}

export interface GameDetail extends Game {
  screenshots?: string[];
  isHidden?: boolean;
  myReview: Review | null;
  reviews: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    items: Review[];
  };
}

export interface MyReview extends Review {
  game: {
    id: string;
    title: string;
    coverUrl: string | null;
    releaseDate: string | null;
  };
}

export interface SearchResults {
  query: string;
  local: Game[];
  external: RawgPreview[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  unlockedAchievements?: Achievement[];
}

export type SortOption =
  | 'score_desc'
  | 'date_asc'
  | 'date_desc'
  | 'title_asc'
  | 'title_desc';

export interface CatalogParams {
  q?: string;
  genreId?: number;
  from?: string;
  to?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}
