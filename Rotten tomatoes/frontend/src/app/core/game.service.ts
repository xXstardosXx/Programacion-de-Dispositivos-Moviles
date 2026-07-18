import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  Achievement,
  CatalogParams,
  Game,
  GameDetail,
  Genre,
  MyReview,
  RawgPreview,
  Review,
} from './models';

interface Paginated<T> {
  results: T[];
  page?: number;
  total?: number;
  hasMore?: boolean;
}

export interface ReviewResponse {
  message: string;
  review: Review;
  audienceScore: number;
  audienceCount: number;
  criticScore: number;
  criticCount: number;
  unlockedAchievements: Achievement[];
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private api = inject(ApiService);

  catalog(params?: CatalogParams): Promise<Paginated<Game>> {
    return this.api.get<Paginated<Game>>('/games', params as Record<string, unknown>);
  }

  mine(params?: CatalogParams): Promise<Paginated<Game>> {
    return this.api.get<Paginated<Game>>('/games/mine', params as Record<string, unknown>);
  }

  trending(genreId?: number): Promise<Paginated<Game>> {
    return this.api.get<Paginated<Game>>('/games/trending', genreId ? { genreId } : undefined);
  }

  genres(): Promise<Genre[]> {
    return this.api.get<Genre[]>('/games/genres');
  }

  discover(genreId?: number): Promise<RawgPreview[]> {
    return this.api.get<RawgPreview[]>('/games/discover', genreId ? { genreId } : undefined);
  }

  search(q: string): Promise<{ local: Game[]; external: RawgPreview[] }> {
    return this.api.get<{ local: Game[]; external: RawgPreview[] }>('/games/search', { q });
  }

  import(rawgId: number): Promise<Game> {
    return this.api.post<Game>('/games/import', { rawgId });
  }

  detail(id: string, page = 1): Promise<GameDetail> {
    return this.api.get<GameDetail>(`/games/${id}`, { page });
  }

  review(gameId: string, score: number, content: string): Promise<ReviewResponse> {
    return this.api.post<ReviewResponse>(`/games/${gameId}/review`, { score, content });
  }

  deleteReview(gameId: string): Promise<{ message: string }> {
    return this.api.delete<{ message: string }>(`/games/${gameId}/review`);
  }

  hide(id: string): Promise<{ message: string }> {
    return this.api.post<{ message: string }>(`/games/${id}/hide`);
  }

  unhide(id: string): Promise<{ message: string }> {
    return this.api.delete<{ message: string }>(`/games/${id}/hide`);
  }

  myReviews(): Promise<MyReview[]> {
    return this.api.get<MyReview[]>('/reviews/mine');
  }
}
