import { User } from '@prisma/client';

const asCodes = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string');
};

// Nunca devolvemos el hash de la contraseña al cliente.
export const serializeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || '',
  achievements: asCodes(user.achievements),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
