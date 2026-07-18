import { Role } from '@prisma/client';

// Límites del servidor. El cliente también los aplica, pero aquí es donde
// realmente se protege la base de datos y la vista.
export const LIMITS = {
  name: 50,
  email: 120,
  password: 64,
  reviewContent: 2000,
  searchQuery: 100,
};

const ALLOWED_EMAIL_DOMAINS = ['@gmail.com', '@hotmail.com'];

export const validateEmail = (email: string): string | null => {
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalized)) {
    return 'Ingresa un email válido (ej: usuario@gmail.com)';
  }
  if (normalized.length > LIMITS.email) {
    return 'El email es demasiado largo';
  }
  const hasAllowedDomain = ALLOWED_EMAIL_DOMAINS.some((d) => normalized.endsWith(d));
  if (!hasAllowedDomain) {
    return 'El email debe ser @gmail.com o @hotmail.com';
  }
  return null;
};

/**
 * Nombre de usuario: sin espacios, longitud razonable, sin caracteres raros.
 * (El nombre ya llega sin espacios porque se sanea con stripAllWhitespace.)
 */
export const validateName = (name: string): string | null => {
  if (name.length < 3) return 'El nombre debe tener al menos 3 caracteres';
  if (name.length > LIMITS.name) return 'El nombre es demasiado largo';
  if (/\s/.test(name)) return 'El nombre de usuario no puede tener espacios';
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return 'Solo se permiten letras, números y . _ -';
  }
  return null;
};

/**
 * Contraseña: mínimo 8, mayúscula, minúscula, número, símbolo y SIN espacios.
 * (Ya llega sin espacios; si el usuario solo puso espacios, queda vacía y falla.)
 */
export const validatePassword = (password: string): string | null => {
  if (/\s/.test(password)) return 'La contraseña no puede contener espacios';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (password.length > LIMITS.password) return 'La contraseña es demasiado larga';
  if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Debe incluir al menos una minúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Debe incluir al menos un símbolo (!@#$%...)';
  }
  return null;
};

export const validateRole = (role: unknown): Role => {
  return role === 'CRITIC' ? 'CRITIC' : 'USER';
};

/** Puntuación de reseña: entero de 1 a 10. */
export const validateScore = (score: unknown): number | null => {
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 10) return null;
  return rounded;
};
