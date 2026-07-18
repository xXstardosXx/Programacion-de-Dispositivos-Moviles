import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Review } from '../core/models';
import { UserAvatarComponent } from './user-avatar.component';
import { RoleBadgeComponent } from './role-badge.component';
import { ScrollableTextBlockComponent } from './scrollable-text-block.component';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    UserAvatarComponent,
    RoleBadgeComponent,
    ScrollableTextBlockComponent,
  ],
  template: `
    <div class="card" [class.own]="isOwn">
      <div class="header">
        <app-user-avatar
          [name]="review.user?.name || 'Usuario'"
          [avatar]="review.user?.avatar"
          [size]="38"
        ></app-user-avatar>
        <div class="who">
          <div class="name-row">
            <span class="name">{{ review.user?.name || 'Usuario' }}</span>
            <span class="you" *ngIf="isOwn">Tú</span>
          </div>
          <app-role-badge [role]="review.user?.role || 'USER'" [small]="true"></app-role-badge>
        </div>
        <span class="score" [style.background]="roleColor + '22'" [style.color]="roleColor">
          <ion-icon name="star"></ion-icon>
          {{ review.score }}/10
        </span>
      </div>

      <app-scrollable-text-block
        *ngIf="review.content; else noComment"
        [text]="review.content"
        [maxHeight]="130"
      ></app-scrollable-text-block>
      <ng-template #noComment>
        <p class="no-comment">Sin comentario.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .card {
        background: var(--qs-surface);
        border: 1px solid var(--qs-border);
        border-radius: var(--qs-radius-md);
        padding: 14px;
        margin-bottom: 12px;
      }
      .card.own {
        border-color: var(--qs-primary);
      }
      .header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      .who {
        flex: 1;
        min-width: 0;
      }
      .name-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .name {
        font-size: 15px;
        font-weight: 700;
        color: var(--qs-text);
      }
      .you {
        font-size: 10px;
        font-weight: 700;
        color: var(--qs-primary);
        background: rgba(225, 29, 42, 0.15);
        padding: 1px 6px;
        border-radius: 999px;
      }
      .score {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 13px;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 999px;
      }
      .score ion-icon {
        font-size: 13px;
      }
      .no-comment {
        margin: 0;
        font-size: 14px;
        font-style: italic;
        color: var(--qs-text-light);
      }
    `,
  ],
})
export class ReviewCardComponent {
  @Input() review!: Review;
  @Input() isOwn = false;

  get roleColor(): string {
    return this.review?.user?.role === 'CRITIC' ? '#FA320A' : '#F5A623';
  }
}
