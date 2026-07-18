import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { toastUnlockedAchievements } from '../../core/achievements-toast.util';
import { getErrorMessage } from '../../core/error.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  loading = false;

  async submit(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.toast.show({
        title: 'Faltan datos',
        message: 'Ingresa tu correo y contraseña.',
        variant: 'error',
      });
      return;
    }

    this.loading = true;
    try {
      const unlocked = await this.auth.login(this.email.trim().toLowerCase(), this.password);
      toastUnlockedAchievements(this.toast, unlocked);
      await this.router.navigateByUrl('/tabs/explore', { replaceUrl: true });
    } catch (error) {
      this.toast.show({
        title: 'No se pudo iniciar sesión',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.loading = false;
    }
  }
}
