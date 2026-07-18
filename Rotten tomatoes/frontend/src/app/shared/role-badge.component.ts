import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Role } from '../core/models';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <span
      class="pill"
      [class.small]="small"
      [style.background]="color + '26'"
    >
      <ion-icon [name]="role === 'CRITIC' ? 'ribbon' : 'people'" [style.color]="color"></ion-icon>
      <span class="label" [style.color]="color">{{ role === 'CRITIC' ? 'Crítico' : 'Audiencia' }}</span>
    </span>
  `,
  styles: [
    `
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
      }
      .pill.small {
        padding: 2px 8px;
      }
      ion-icon {
        font-size: 13px;
      }
      .label {
        font-size: 12px;
        font-weight: 700;
      }
      .small .label {
        font-size: 10px;
      }
      .small ion-icon {
        font-size: 11px;
      }
    `,
  ],
})
export class RoleBadgeComponent {
  @Input() role: Role = 'USER';
  @Input() small = false;

  get color(): string {
    return this.role === 'CRITIC' ? '#FA320A' : '#F5A623';
  }
}
