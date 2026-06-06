const ALLOWED_EMAIL_DOMAINS = ['@gmail.com', '@hotmail.com'];

export const validateEmail = (email: string): string | null => {
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalized)) {
    return 'Ingresa un email válido (ej: usuario@gmail.com)';
  }

  const hasAllowedDomain = ALLOWED_EMAIL_DOMAINS.some((domain) =>
    normalized.endsWith(domain)
  );

  if (!hasAllowedDomain) {
    return 'El email debe ser @gmail.com o @hotmail.com';
  }

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Debe incluir al menos una mayúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'Debe incluir al menos una minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'Debe incluir al menos un número';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Debe incluir al menos un símbolo (!@#$%...)';
  }
  return null;
};
