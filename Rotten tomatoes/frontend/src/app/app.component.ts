import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ToastHostComponent } from './core/toast/toast-host.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, ToastHostComponent],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
      <app-toast-host></app-toast-host>
    </ion-app>
  `,
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);

  ngOnInit(): void {
    void this.auth.init();
  }
}
