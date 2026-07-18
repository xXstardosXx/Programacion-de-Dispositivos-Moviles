import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../core/game.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { toastUnlockedAchievements } from '../../core/achievements-toast.util';
import { getErrorMessage } from '../../core/error.util';
import { LIMITS } from '../../core/constants';
import { GameDetail, Review } from '../../core/models';
import { ScoreBadgeComponent } from '../../shared/score-badge.component';
import { ScoreSelectorComponent } from '../../shared/score-selector.component';
import { ReviewCardComponent } from '../../shared/review-card.component';
import { ScrollableTextBlockComponent } from '../../shared/scrollable-text-block.component';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScoreBadgeComponent,
    ScoreSelectorComponent,
    ReviewCardComponent,
    ScrollableTextBlockComponent,
  ],
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
})
export class GameDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private games = inject(GameService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  gameId = '';
  game: GameDetail | null = null;
  reviews: Review[] = [];
  page = 1;
  hasMore = false;

  score = 0;
  content = '';
  loading = true;
  saving = false;
  loadingMore = false;
  maxContent = LIMITS.reviewContent;

  async ionViewWillEnter(): Promise<void> {
    this.gameId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.load();
  }

  get myUserId(): string | undefined {
    return this.auth.user()?.id;
  }

  get hasMyReview(): boolean {
    return !!this.game?.myReview;
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const detail = await this.games.detail(this.gameId, 1);
      this.game = detail;
      this.reviews = detail.reviews.items || [];
      this.page = detail.reviews.page || 1;
      this.hasMore = detail.reviews.hasMore;
      if (detail.myReview) {
        this.score = detail.myReview.score;
        this.content = detail.myReview.content || '';
      } else {
        this.score = 0;
        this.content = '';
      }
    } catch (error) {
      this.toast.show({
        title: 'Error al cargar el juego',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.loading = false;
    }
  }

  async loadMore(): Promise<void> {
    if (!this.hasMore || this.loadingMore) return;
    this.loadingMore = true;
    try {
      const next = this.page + 1;
      const detail = await this.games.detail(this.gameId, next);
      this.reviews = [...this.reviews, ...(detail.reviews.items || [])];
      this.page = detail.reviews.page || next;
      this.hasMore = detail.reviews.hasMore;
    } catch (error) {
      this.toast.show({ title: 'Error', message: getErrorMessage(error), variant: 'error' });
    } finally {
      this.loadingMore = false;
    }
  }

  async submitReview(): Promise<void> {
    if (this.score < 1 || this.score > 10) {
      this.toast.show({
        title: 'Elige una puntuación',
        message: 'Selecciona un valor de 1 a 10.',
        variant: 'error',
      });
      return;
    }
    this.saving = true;
    try {
      const res = await this.games.review(this.gameId, this.score, this.content.trim());
      this.toast.show({
        title: this.hasMyReview ? 'Reseña actualizada' : 'Reseña publicada',
        message: '¡Gracias por tu opinión!',
        variant: 'success',
      });
      toastUnlockedAchievements(this.toast, res.unlockedAchievements);
      await this.auth.refreshProfile();
      await this.load();
    } catch (error) {
      this.toast.show({
        title: 'No se pudo guardar la reseña',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.saving = false;
    }
  }

  async deleteReview(): Promise<void> {
    this.saving = true;
    try {
      await this.games.deleteReview(this.gameId);
      this.score = 0;
      this.content = '';
      this.toast.show({ title: 'Reseña eliminada', variant: 'info' });
      await this.load();
    } catch (error) {
      this.toast.show({
        title: 'No se pudo eliminar',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.saving = false;
    }
  }

  async toggleHidden(): Promise<void> {
    if (!this.game) return;
    try {
      if (this.game.isHidden) {
        await this.games.unhide(this.gameId);
        this.game.isHidden = false;
        this.toast.show({ title: 'Restaurado en tu catálogo', variant: 'success' });
      } else {
        await this.games.hide(this.gameId);
        this.game.isHidden = true;
        this.toast.show({ title: 'Quitado de tu catálogo', variant: 'info' });
      }
    } catch (error) {
      this.toast.show({ title: 'Error', message: getErrorMessage(error), variant: 'error' });
    }
  }

  back(): void {
    this.router.navigateByUrl('/tabs/explore');
  }

  year(date: string | null): string | null {
    return date ? new Date(date).getFullYear().toString() : null;
  }

  /** Acepta string[] o { name }[] por si el API mezcla formatos. */
  labels(items: unknown[] | null | undefined): string[] {
    if (!items?.length) return [];
    return items
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'name' in item) {
          const name = (item as { name?: unknown }).name;
          return typeof name === 'string' ? name : '';
        }
        return '';
      })
      .filter(Boolean);
  }
}
