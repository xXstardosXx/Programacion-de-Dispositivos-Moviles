import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export const generateToken = (userId: string, role: Role): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId, role }, secret, options);
};
