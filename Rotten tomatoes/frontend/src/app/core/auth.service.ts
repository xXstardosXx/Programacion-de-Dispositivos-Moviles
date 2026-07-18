import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { clearToken, getToken, setToken } from './token-store';
import { Achievement, AuthResponse, Role, User } from './models';

interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string | null;
  role?: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);

  readonly user = signal<User | null>(null);
  readonly loading = signal<boolean>(true);
  readonly isAuthenticated = computed(() => !!this.user() || !!getToken());

  async init(): Promise<void> {
    const token = getToken();
    if (!token) {
      this.loading.set(false);
      return;
    }
    try {
      const user = await this.api.get<User>('/auth/profile');
      this.user.set(user);
    } catch {
      clearToken();
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private saveSession(res: AuthResponse): Achievement[] {
    if (res.token) setToken(res.token);
    if (res.user) this.user.set(res.user);
    return res.unlockedAchievements ?? [];
  }

  async login(email: string, password: string): Promise<Achievement[]> {
    const res = await this.api.post<AuthResponse>('/auth/login', { email, password });
    return this.saveSession(res);
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: Role
  ): Promise<Achievement[]> {
    const res = await this.api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      role,
    });
    return this.saveSession(res);
  }

  async updateProfile(data: UpdateProfileData): Promise<Achievement[]> {
    const res = await this.api.put<AuthResponse>('/auth/profile', data);
    if (res.token) setToken(res.token);
    if (res.user) this.user.set(res.user);
    return res.unlockedAchievements ?? [];
  }

  async deleteAccount(): Promise<Achievement[]> {
    const res = await this.api.delete<{ unlockedAchievements?: Achievement[] }>(
      '/auth/profile'
    );
    const unlocked = res?.unlockedAchievements ?? [];
    this.logout();
    return unlocked;
  }

  async refreshProfile(): Promise<void> {
    try {
      const user = await this.api.get<User>('/auth/profile');
      this.user.set(user);
    } catch {
      /* noop */
    }
  }

  logout(): void {
    clearToken();
    this.user.set(null);
  }
}
