import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign({ userId: userId.toString() }, secret, options);
};
