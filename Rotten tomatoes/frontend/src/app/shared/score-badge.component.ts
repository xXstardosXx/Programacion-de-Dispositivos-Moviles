import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <!-- Compacto -->
    <span *ngIf="compact" class="compact" [style.color]="color">
      <ion-icon [name]="icon"></ion-icon>
      <span *ngIf="count > 0" class="value">{{ score | number: '1.1-1' }}</span>
      <span *ngIf="count === 0" class="value">—</span>
    </span>

    <!-- Completo -->
    <div *ngIf="!compact" class="full" [style.borderColor]="color + '55'">
      <ion-icon [name]="icon" [style.color]="color"></ion-icon>
      <div class="score-row" *ngIf="count > 0; else noData">
        <span class="score" [style.color]="color">{{ score | number: '1.1-1' }}</span>
        <span class="max">/10</span>
      </div>
      <ng-template #noData>
        <span class="score" [style.color]="color">—</span>
      </ng-template>
      <span class="label">{{ label }}</span>
      <span class="count">{{ count }} {{ count === 1 ? 'reseña' : 'reseñas' }}</span>
    </div>
  `,
  styles: [
    `
      .compact {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .compact ion-icon {
        font-size: 13px;
      }
      .compact .value {
        font-size: 13px;
        font-weight: 700;
      }
      .full {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 16px;
        border-radius: var(--qs-radius-md);
        border: 1.5px solid;
        background: var(--qs-surface);
      }
      .full ion-icon {
        font-size: 22px;
        margin-bottom: 2px;
      }
      .score-row {
        display: flex;
        align-items: baseline;
        gap: 2px;
      }
      .score {
        font-size: 26px;
        font-weight: 800;
      }
      .max {
        font-size: 13px;
        color: var(--qs-text-light);
      }
      .label {
        font-size: 12px;
        font-weight: 700;
        color: var(--qs-text);
      }
      .count {
        font-size: 11px;
        color: var(--qs-text-light);
      }
    `,
  ],
})
export class ScoreBadgeComponent {
  @Input() score = 0;
  @Input() count = 0;
  @Input() kind: 'audience' | 'critic' = 'audience';
  @Input() compact = false;

  get color(): string {
    return this.kind === 'critic' ? '#FA320A' : '#F5A623';
  }
  get icon(): string {
    return this.kind === 'critic' ? 'ribbon' : 'people';
  }
  get label(): string {
    return this.kind === 'critic' ? 'Críticos' : 'Audiencia';
  }
}
