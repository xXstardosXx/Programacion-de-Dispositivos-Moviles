import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: Role;
}

// Adjunta el usuario si hay token válido, pero no bloquea la petición si no lo hay.
// Se usa en el catálogo/detalle para poder marcar "tu reseña" sin exigir login.
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
      req.userId = decoded.userId;
      req.userRole = decoded.role;
    } catch {
      // Token inválido: continuar como invitado.
    }
  }

  next();
};
