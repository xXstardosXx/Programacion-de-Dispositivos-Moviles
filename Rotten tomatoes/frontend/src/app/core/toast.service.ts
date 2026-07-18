import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'achievement';

export interface ToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  icon?: string;
  durationMs?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<ToastOptions | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(opts: ToastOptions): void {
    if (this.timer) clearTimeout(this.timer);
    this.current.set({ ...opts });
    const duration = opts.durationMs ?? 3200;
    this.timer = setTimeout(() => this.hide(), duration);
  }

  hide(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.current.set(null);
  }
}
