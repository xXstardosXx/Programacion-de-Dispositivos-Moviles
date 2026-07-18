import { HttpInterceptorFn } from '@angular/common/http';
import { getToken } from './token-store';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
