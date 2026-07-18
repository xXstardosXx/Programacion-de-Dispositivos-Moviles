import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getToken } from './token-store';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (getToken()) {
    router.navigateByUrl('/tabs/explore', { replaceUrl: true });
    return false;
  }
  return true;
};
