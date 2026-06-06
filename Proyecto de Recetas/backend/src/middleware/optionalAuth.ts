import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface JwtPayload {
  userId: string;
}

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (header?.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret'
      ) as JwtPayload;
      req.userId = new Types.ObjectId(decoded.userId);
    } catch {
      // Token invalido: continuar sin usuario
    }
  }

  next();
};
