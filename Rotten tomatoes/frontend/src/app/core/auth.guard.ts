import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getToken } from './token-store';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (getToken()) return true;
  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};
