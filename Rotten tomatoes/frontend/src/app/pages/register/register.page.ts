import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { toastUnlockedAchievements } from '../../core/achievements-toast.util';
import { getErrorMessage } from '../../core/error.util';
import { Role } from '../../core/models';
import {
  getEmailError,
  getNameError,
  getPasswordChecks,
  getPasswordError,
} from '../../core/validation';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirm = '';
  role: Role = 'USER';
  showPassword = false;
  loading = false;

  get checks() {
    return getPasswordChecks(this.password);
  }

  get checkList() {
    const c = this.checks;
    return [
      { ok: c.length, label: 'Al menos 8 caracteres' },
      { ok: c.uppercase, label: 'Una mayúscula' },
      { ok: c.lowercase, label: 'Una minúscula' },
      { ok: c.number, label: 'Un número' },
      { ok: c.symbol, label: 'Un símbolo' },
      { ok: c.noSpaces, label: 'Sin espacios' },
    ];
  }

  goBack(): void {
    this.router.navigateByUrl('/login');
  }

  async submit(): Promise<void> {
    const nameError = getNameError(this.name);
    const emailError = getEmailError(this.email);
    const passwordError = getPasswordError(this.password);

    if (nameError || emailError || passwordError) {
      this.toast.show({
        title: 'Revisa los datos',
        message: nameError || emailError || passwordError || '',
        variant: 'error',
      });
      return;
    }
    if (this.password !== this.confirm) {
      this.toast.show({
        title: 'Las contraseñas no coinciden',
        variant: 'error',
      });
      return;
    }

    this.loading = true;
    try {
      const unlocked = await this.auth.register(
        this.name.trim(),
        this.email.trim().toLowerCase(),
        this.password,
        this.role
      );
      toastUnlockedAchievements(this.toast, unlocked, 400);
      await this.router.navigateByUrl('/tabs/explore', { replaceUrl: true });
    } catch (error) {
      this.toast.show({
        title: 'No se pudo registrar',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.loading = false;
    }
  }
}
