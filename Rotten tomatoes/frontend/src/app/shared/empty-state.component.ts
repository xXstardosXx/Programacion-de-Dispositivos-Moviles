import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="empty">
      <div class="icon-wrap">
        <ion-icon [name]="icon"></ion-icon>
      </div>
      <p class="title">{{ title }}</p>
      <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 80px 24px 0;
      }
      .icon-wrap {
        width: 96px;
        height: 96px;
        border-radius: 999px;
        background: rgba(225, 29, 42, 0.13);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      .icon-wrap ion-icon {
        font-size: 48px;
        color: var(--qs-primary);
      }
      .title {
        font-size: 20px;
        font-weight: 700;
        color: var(--qs-text);
        margin: 0;
      }
      .subtitle {
        font-size: 14px;
        color: var(--qs-text-light);
        line-height: 22px;
        margin: 6px 0 0;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'sad-outline';
  @Input() title = '';
  @Input() subtitle?: string;
}
