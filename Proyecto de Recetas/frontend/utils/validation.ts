import { LIMITS } from '../constants/limits';

const ALLOWED_DOMAINS = ['@gmail.com', '@hotmail.com'];

export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}

export const getPasswordChecks = (password: string): PasswordChecks => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
});

export const isPasswordValid = (password: string): boolean =>
  Object.values(getPasswordChecks(password)).every(Boolean);

export const getPasswordError = (password: string): string | null => {
  const checks = getPasswordChecks(password);
  if (!checks.length) return 'Mínimo 8 caracteres';
  if (!checks.uppercase) return 'Debe incluir al menos una mayúscula';
  if (!checks.lowercase) return 'Debe incluir al menos una minúscula';
  if (!checks.number) return 'Debe incluir al menos un número';
  if (!checks.symbol) return 'Debe incluir al menos un símbolo (!@#$%...)';
  return null;
};

export const getEmailError = (email: string): string | null => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 'El email es obligatorio';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return 'Ingresa un email válido (ej: usuario@gmail.com)';
  }

  const hasAllowedDomain = ALLOWED_DOMAINS.some((d) => normalized.endsWith(d));
  if (!hasAllowedDomain) {
    return 'El email debe ser @gmail.com o @hotmail.com';
  }

  return null;
};

export const truncate = (value: string, max: number): string =>
  value.length > max ? value.slice(0, max) : value;
