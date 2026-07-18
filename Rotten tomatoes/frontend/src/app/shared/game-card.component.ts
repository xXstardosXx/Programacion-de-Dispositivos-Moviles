import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ScoreBadgeComponent } from './score-badge.component';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, IonicModule, ScoreBadgeComponent],
  template: `
    <button type="button" class="card" (click)="press.emit()">
      <div class="cover">
        <img *ngIf="coverUrl; else noCover" [src]="coverUrl" alt="" />
        <ng-template #noCover>
          <div class="cover-fallback">
            <ion-icon name="game-controller"></ion-icon>
          </div>
        </ng-template>
      </div>

      <div class="content">
        <p class="title">{{ title }}</p>

        <div class="meta" *ngIf="year || (genres && genres.length)">
          <ion-icon name="game-controller"></ion-icon>
          <span>{{ metaLine }}</span>
        </div>

        <div class="scores" *ngIf="!isNew; else newTag">
          <app-score-badge
            [score]="audienceScore || 0"
            [count]="audienceCount || 0"
            kind="audience"
            [compact]="true"
          ></app-score-badge>
          <app-score-badge
            [score]="criticScore || 0"
            [count]="criticCount || 0"
            kind="critic"
            [compact]="true"
          ></app-score-badge>
        </div>
        <ng-template #newTag>
          <span class="new-tag">Sin reseñas aún</span>
        </ng-template>
      </div>

      <ion-icon class="chevron" name="chevron-forward"></ion-icon>
    </button>
  `,
  styles: [
    `
      .card {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--qs-surface);
        border-radius: var(--qs-radius-lg);
        padding: 8px;
        margin-bottom: 16px;
        box-shadow: var(--qs-shadow-card);
        text-align: left;
      }
      .cover {
        width: 60px;
        height: 80px;
        border-radius: var(--qs-radius-md);
        overflow: hidden;
        flex-shrink: 0;
      }
      .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cover-fallback {
        width: 100%;
        height: 100%;
        background: var(--qs-surface-alt);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cover-fallback ion-icon {
        font-size: 26px;
        color: var(--qs-text-light);
      }
      .content {
        flex: 1;
        min-width: 0;
      }
      .title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--qs-text);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        color: var(--qs-text-light);
        font-size: 11px;
      }
      .meta ion-icon {
        font-size: 12px;
      }
      .scores {
        display: flex;
        gap: 14px;
        margin-top: 8px;
      }
      .new-tag {
        display: inline-block;
        margin-top: 8px;
        font-size: 11px;
        font-weight: 700;
        color: var(--qs-audience);
        background: rgba(245, 166, 35, 0.13);
        padding: 3px 8px;
        border-radius: 999px;
      }
      .chevron {
        color: var(--qs-text-light);
        font-size: 18px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class GameCardComponent {
  @Input() title = '';
  @Input() coverUrl: string | null = null;
  @Input() year: string | null = null;
  @Input() genres?: string[];
  @Input() platforms?: string[];
  @Input() audienceScore?: number;
  @Input() audienceCount?: number;
  @Input() criticScore?: number;
  @Input() criticCount?: number;
  @Input() isNew = false;
  @Output() press = new EventEmitter<void>();

  get metaLine(): string {
    const parts: string[] = [];
    if (this.year) parts.push(this.year);
    const genreNames = (this.genres || [])
      .map((g: unknown) => (typeof g === 'string' ? g : (g as { name?: string })?.name || ''))
      .filter(Boolean)
      .slice(0, 3);
    if (genreNames.length) parts.push(genreNames.join(' · '));
    return parts.join('  •  ');
  }
}
