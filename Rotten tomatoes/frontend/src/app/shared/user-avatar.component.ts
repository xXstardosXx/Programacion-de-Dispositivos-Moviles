import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      *ngIf="avatar; else initialTpl"
      [src]="avatar"
      [style.width.px]="size"
      [style.height.px]="size"
      class="avatar-img"
      alt=""
    />
    <ng-template #initialTpl>
      <div
        class="avatar-fallback"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.fontSize.px]="size * 0.42"
      >
        {{ initial }}
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .avatar-img {
        border-radius: 999px;
        object-fit: cover;
      }
      .avatar-fallback {
        border-radius: 999px;
        background: var(--qs-primary);
        color: #fff;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class UserAvatarComponent {
  @Input() name = '';
  @Input() avatar?: string | null;
  @Input() size = 40;

  get initial(): string {
    return (this.name?.trim()?.charAt(0) || '?').toUpperCase();
  }
}
