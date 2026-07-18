export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
  noSpaces: boolean;
}

export const getPasswordChecks = (password: string): PasswordChecks => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  symbol: /[^A-Za-z0-9]/.test(password),
  noSpaces: !/\s/.test(password) && password.length > 0,
});

export const isPasswordValid = (password: string): boolean => {
  const c = getPasswordChecks(password);
  return c.length && c.uppercase && c.lowercase && c.number && c.symbol && c.noSpaces;
};

export const getPasswordError = (password: string): string | null => {
  if (!password) return 'La contraseña es obligatoria';
  const c = getPasswordChecks(password);
  if (!c.noSpaces) return 'La contraseña no puede tener espacios';
  if (!c.length) return 'Debe tener al menos 8 caracteres';
  if (!c.uppercase) return 'Debe incluir una mayúscula';
  if (!c.lowercase) return 'Debe incluir una minúscula';
  if (!c.number) return 'Debe incluir un número';
  if (!c.symbol) return 'Debe incluir un símbolo';
  return null;
};

export const getNameError = (name: string): string | null => {
  const value = name.trim();
  if (!value) return 'El nombre de usuario es obligatorio';
  if (value.length < 3) return 'Debe tener al menos 3 caracteres';
  if (/\s/.test(name)) return 'No puede contener espacios';
  if (!/^[a-zA-Z0-9._-]+$/.test(value))
    return 'Solo letras, números y . _ -';
  return null;
};

export const getEmailError = (email: string): string | null => {
  const value = email.trim().toLowerCase();
  if (!value) return 'El correo es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo inválido';
  if (!/@(gmail|hotmail)\.com$/.test(value))
    return 'Solo se permite @gmail.com o @hotmail.com';
  return null;
};

export const truncate = (value: string, max: number): string =>
  value.length > max ? value.slice(0, max) : value;

export const stripSpaces = (value: string): string => value.replace(/\s/g, '');
