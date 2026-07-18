import { Achievement } from './models';
import { getAchievement } from './achievements';
import { ToastService } from './toast.service';

/**
 * Muestra secuencialmente los logros desbloqueados como toasts tipo "achievement".
 */
export const toastUnlockedAchievements = (
  toast: ToastService,
  unlocked: Achievement[] | undefined,
  delayMs = 700
): void => {
  if (!unlocked || unlocked.length === 0) return;

  unlocked.forEach((raw, index) => {
    const def = getAchievement(raw.code);
    const title = def?.title ?? raw.title;
    const message = def?.description ?? raw.description;
    const icon = def?.icon ?? raw.icon ?? 'trophy';

    setTimeout(() => {
      toast.show({
        title: `Logro: ${title}`,
        message,
        variant: 'achievement',
        icon,
        durationMs: 3800,
      });
    }, delayMs + index * 1000);
  });
};
