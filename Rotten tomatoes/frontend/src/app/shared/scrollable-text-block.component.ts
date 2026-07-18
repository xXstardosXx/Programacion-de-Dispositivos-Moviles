import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-scrollable-text-block',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="block" [style.maxHeight.px]="maxHeight">
      <p class="text">{{ text }}</p>
    </div>
    <button *ngIf="text && text.length > 300" type="button" class="more" (click)="open = true">
      Ver completo
    </button>

    <ion-modal [isOpen]="open" (didDismiss)="open = false">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ title || 'Detalle' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="open = false">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <p class="modal-text">{{ text }}</p>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [
    `
      .block {
        background: var(--qs-surface-alt);
        border: 1px solid var(--qs-border);
        border-radius: var(--qs-radius-md);
        padding: 16px;
        overflow-y: auto;
      }
      .text {
        margin: 0;
        font-size: 15px;
        line-height: 23px;
        color: var(--qs-text);
        white-space: pre-wrap;
      }
      .more {
        margin-top: 8px;
        background: transparent;
        color: var(--qs-primary);
        font-size: 13px;
        font-weight: 700;
      }
      .modal-text {
        font-size: 15px;
        line-height: 24px;
        color: var(--qs-text);
        white-space: pre-wrap;
      }
    `,
  ],
})
export class ScrollableTextBlockComponent {
  @Input() text = '';
  @Input() maxHeight = 160;
  @Input() title?: string;
  open = false;
}
