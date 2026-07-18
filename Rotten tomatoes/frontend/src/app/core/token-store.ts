// Almacenamiento del token JWT. localStorage funciona tanto en el navegador
// como dentro del WebView de Capacitor en Android.
const TOKEN_KEY = 'token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* noop */
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
};
