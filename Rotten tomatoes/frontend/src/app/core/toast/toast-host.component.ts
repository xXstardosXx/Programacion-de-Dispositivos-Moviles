import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ToastService, ToastVariant } from '../toast.service';

interface VariantStyle {
  bg: string;
  accent: string;
  icon: string;
}

const VARIANTS: Record<ToastVariant, VariantStyle> = {
  success: { bg: '#1A2E24', accent: '#21D07A', icon: 'checkmark-circle' },
  error: { bg: '#2E1A1A', accent: '#FF5A5F', icon: 'alert-circle' },
  info: { bg: '#1E1B18', accent: '#E11D2A', icon: 'information-circle' },
  achievement: { bg: '#2A2210', accent: '#F5C518', icon: 'trophy' },
};

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="toast-wrap" *ngIf="toast.current() as t">
      <button
        type="button"
        class="toast"
        [style.background]="style().bg"
        [style.borderColor]="style().accent"
        (click)="toast.hide()"
      >
        <div class="bubble" [style.background]="style().accent + '26'">
          <ion-icon [name]="t.icon || style().icon" [style.color]="style().accent"></ion-icon>
        </div>
        <div class="body">
          <p class="title">{{ t.title }}</p>
          <p class="msg" *ngIf="t.message">{{ t.message }}</p>
        </div>
        <ion-icon class="close" name="close" (click)="$event.stopPropagation(); toast.hide()"></ion-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .toast-wrap {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        display: flex;
        justify-content: center;
        padding: max(16px, env(safe-area-inset-top)) 16px 0;
        pointer-events: none;
      }
      .toast {
        pointer-events: auto;
        width: 100%;
        max-width: 560px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px;
        border-radius: 20px;
        border: 1.5px solid;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5);
        text-align: left;
        animation: toast-in 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .bubble {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .bubble ion-icon {
        font-size: 22px;
      }
      .body {
        flex: 1;
        min-width: 0;
      }
      .title {
        margin: 0;
        font-size: 15px;
        font-weight: 800;
        color: #f5f3f0;
      }
      .msg {
        margin: 2px 0 0;
        font-size: 13px;
        color: #a39e97;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .close {
        font-size: 16px;
        color: #a39e97;
        flex-shrink: 0;
      }
      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(-24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);

  readonly style = computed<VariantStyle>(() => {
    const variant = this.toast.current()?.variant ?? 'info';
    return VARIANTS[variant];
  });
}
