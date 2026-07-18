import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { GameService } from '../../core/game.service';
import { ToastService } from '../../core/toast.service';
import { getErrorMessage } from '../../core/error.util';
import { MyReview } from '../../core/models';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, IonicModule, EmptyStateComponent],
  templateUrl: './my-reviews.page.html',
  styleUrls: ['./my-reviews.page.scss'],
})
export class MyReviewsPage {
  private games = inject(GameService);
  private toast = inject(ToastService);
  private router = inject(Router);

  reviews: MyReview[] = [];
  loading = false;

  async ionViewWillEnter(): Promise<void> {
    await this.load();
  }

  async load(event?: CustomEvent): Promise<void> {
    if (!event) this.loading = true;
    try {
      this.reviews = await this.games.myReviews();
    } catch (error) {
      this.toast.show({
        title: 'Error al cargar tus reseñas',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.loading = false;
      if (event) (event.target as any)?.complete();
    }
  }

  open(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }

  year(date: string | null): string | null {
    return date ? new Date(date).getFullYear().toString() : null;
  }
}
