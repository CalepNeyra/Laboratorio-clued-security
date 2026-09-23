import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserSubject } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: UserSubject;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
    req.user = user as UserSubject;
    next();
  });
};