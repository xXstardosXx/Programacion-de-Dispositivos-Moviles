import { HttpErrorResponse } from '@angular/common/http';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpErrorResponse) {
    return error.error?.message || error.message || 'Error de conexión';
  }
  return 'Ocurrió un error inesperado';
};
