import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GameService } from '../../core/game.service';
import { ToastService } from '../../core/toast.service';
import { getErrorMessage } from '../../core/error.util';
import { SORT_OPTIONS } from '../../core/constants';
import { Game, Genre, RawgPreview, SortOption } from '../../core/models';
import { GameCardComponent } from '../../shared/game-card.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, GameCardComponent, EmptyStateComponent],
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage {
  private games = inject(GameService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private actionSheet = inject(ActionSheetController);

  query = '';
  selectedGenre: number | null = null;
  sort: SortOption = 'score_desc';
  sortOptions = SORT_OPTIONS;

  genres: Genre[] = [];
  trending: Game[] = [];
  discover: RawgPreview[] = [];
  showAllTrending = false;

  searchLocal: Game[] = [];
  searchExternal: RawgPreview[] = [];

  loading = false;
  searching = false;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private busyExternal = false;

  get isSearchMode(): boolean {
    return this.query.trim().length >= 2;
  }

  get visibleTrending(): Game[] {
    return this.showAllTrending ? this.trending : this.trending.slice(0, 5);
  }

  get sortLabel(): string {
    return this.sortOptions.find((s) => s.value === this.sort)?.label ?? 'Ordenar';
  }

  async ionViewWillEnter(): Promise<void> {
    if (!this.genres.length) {
      try {
        this.genres = await this.games.genres();
      } catch {
        this.genres = [];
      }
    }
    if (!this.isSearchMode) {
      await this.loadHome();
    }
  }

  async loadHome(event?: CustomEvent): Promise<void> {
    this.loading = true;
    try {
      const genreId = this.selectedGenre ?? undefined;
      const [mineRes, trendRes] = await Promise.all([
        this.games.mine({ genreId, sort: this.sort }),
        this.games.trending(genreId),
      ]);
      // mine solo para no repetir en "Para descubrir"
      const myRawgIds = new Set((mineRes.results || []).map((g) => g.rawgId));
      this.trending = trendRes.results || [];
      this.showAllTrending = false;

      try {
        const disc = await this.games.discover(genreId);
        const known = new Set<number>([
          ...myRawgIds,
          ...this.trending.map((g) => g.rawgId),
        ]);
        this.discover = (disc || []).filter((g) => !known.has(g.rawgId));
      } catch {
        this.discover = [];
      }
    } catch (error) {
      this.toast.show({
        title: 'Error al cargar',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.loading = false;
      if (event) (event.target as any)?.complete();
    }
  }

  onSearchChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (!this.isSearchMode) {
      this.searchLocal = [];
      this.searchExternal = [];
      return;
    }
    this.searchTimer = setTimeout(() => this.runSearch(), 450);
  }

  async runSearch(): Promise<void> {
    const q = this.query.trim();
    if (q.length < 2) return;
    this.searching = true;
    try {
      const res = await this.games.search(q);
      this.searchLocal = res.local || [];
      this.searchExternal = res.external || [];
    } catch (error) {
      this.toast.show({
        title: 'Error al buscar',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.searching = false;
    }
  }

  clearSearch(): void {
    this.query = '';
    this.searchLocal = [];
    this.searchExternal = [];
    void this.loadHome();
  }

  selectGenre(id: number | null): void {
    this.selectedGenre = this.selectedGenre === id ? null : id;
    if (this.isSearchMode) {
      void this.runSearch();
    } else {
      void this.loadHome();
    }
  }

  async openSort(): Promise<void> {
    const sheet = await this.actionSheet.create({
      header: 'Ordenar por',
      buttons: [
        ...this.sortOptions.map((o) => ({
          text: o.label,
          handler: () => {
            this.sort = o.value;
            void this.loadHome();
          },
        })),
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  openLocal(id: string): void {
    this.router.navigate(['/game', id]);
  }

  async openExternal(rawgId: number): Promise<void> {
    if (this.busyExternal) return;
    this.busyExternal = true;
    try {
      const game = await this.games.import(rawgId);
      this.router.navigate(['/game', game.id]);
    } catch (error) {
      this.toast.show({
        title: 'No se pudo abrir el juego',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.busyExternal = false;
    }
  }

  year(date: string | null): string | null {
    return date ? new Date(date).getFullYear().toString() : null;
  }
}
