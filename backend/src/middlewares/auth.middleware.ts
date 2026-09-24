import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserSubject {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  nivel_seguridad: number;
  pais: string;
  tipo_contrato: 'INTERNO' | 'EXTERNO';
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface AuthenticatedRequest extends Request {
  user?: UserSubject;
  resource?: any;
  auditReason?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso no proporcionado' });
  }

  // Clave secreta unificada con el auth.controller.ts
  const secret = process.env.JWT_SECRET || 'supersecreto_jwt_key_12345';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = user as UserSubject;
    next();
  });
};