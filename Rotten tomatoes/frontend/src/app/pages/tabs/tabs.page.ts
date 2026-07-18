import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="explore">
          <ion-icon name="search-outline"></ion-icon>
          <ion-label>Explorar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="my-reviews">
          <ion-icon name="chatbox-ellipses-outline"></ion-icon>
          <ion-label>Mis Reseñas</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [
    `
      ion-tab-bar {
        --background: var(--qs-surface);
        border-top: 1px solid var(--qs-border);
        height: 60px;
        padding-top: 6px;
        padding-bottom: 6px;
      }
      ion-tab-button {
        --color: var(--qs-text-light);
        --color-selected: var(--qs-primary);
      }
      ion-label {
        font-size: 11px;
        font-weight: 600;
      }
    `,
  ],
})
export class TabsPage {}
