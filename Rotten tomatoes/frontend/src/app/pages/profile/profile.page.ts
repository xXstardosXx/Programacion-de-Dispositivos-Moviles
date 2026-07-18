import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { toastUnlockedAchievements } from '../../core/achievements-toast.util';
import { getErrorMessage } from '../../core/error.util';
import { ACHIEVEMENTS } from '../../core/achievements';
import { Role } from '../../core/models';
import { RoleBadgeComponent } from '../../shared/role-badge.component';
import { UserAvatarComponent } from '../../shared/user-avatar.component';

const MAX_AVATAR = 1_500_000;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RoleBadgeComponent, UserAvatarComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  name = '';
  email = '';
  password = '';
  role: Role = 'USER';
  avatar: string | null | undefined = undefined;
  saving = false;

  // Muestra todos los logros menos "rage_quit" (irreversible).
  achievements = ACHIEVEMENTS.filter((a) => a.code !== 'rage_quit');

  get user() {
    return this.auth.user();
  }

  ionViewWillEnter(): void {
    const u = this.user;
    if (u) {
      this.name = u.name;
      this.email = u.email;
      this.role = u.role;
      this.avatar = u.avatar ?? null;
      this.password = '';
    }
  }

  isUnlocked(code: string): boolean {
    return this.user?.achievements?.includes(code) ?? false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      if (result.length > MAX_AVATAR) {
        this.toast.show({
          title: 'Imagen demasiado grande',
          message: 'Elige una foto más liviana (menos de ~1.5 MB).',
          variant: 'error',
        });
        return;
      }
      this.avatar = result;
    };
    reader.readAsDataURL(file);
  }

  async save(): Promise<void> {
    this.saving = true;
    try {
      const data: {
        name?: string;
        email?: string;
        password?: string;
        avatar?: string | null;
        role?: Role;
      } = {
        name: this.name.trim(),
        email: this.email.trim().toLowerCase(),
        role: this.role,
        avatar: this.avatar ?? '',
      };
      if (this.password) data.password = this.password;

      const unlocked = await this.auth.updateProfile(data);
      this.password = '';
      this.toast.show({
        title: 'Perfil actualizado',
        message: 'Tus cambios se guardaron correctamente.',
        variant: 'success',
      });
      toastUnlockedAchievements(this.toast, unlocked);
    } catch (error) {
      this.toast.show({
        title: 'No se pudo guardar',
        message: getErrorMessage(error),
        variant: 'error',
      });
    } finally {
      this.saving = false;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cuenta',
      message:
        'Esta acción es irreversible. Se borrará tu cuenta y todas tus reseñas. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteAccount(),
        },
      ],
    });
    await alert.present();
  }

  private async deleteAccount(): Promise<void> {
    try {
      const unlocked = await this.auth.deleteAccount();
      toastUnlockedAchievements(this.toast, unlocked, 200);
      setTimeout(() => this.router.navigateByUrl('/login', { replaceUrl: true }), 1600);
    } catch (error) {
      this.toast.show({
        title: 'No se pudo eliminar la cuenta',
        message: getErrorMessage(error),
        variant: 'error',
      });
    }
  }
}
