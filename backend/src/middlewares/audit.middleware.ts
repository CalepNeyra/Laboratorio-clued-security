import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { pool } from '../config/database';

export const auditLogger = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  res.on('finish', async () => {
    if (res.statusCode < 400 && req.user) {
      try {
        await pool.query(
          `INSERT INTO auditoria (usuario_email, rol, departamento_usuario, recurso, accion, ip_origen, resultado, motivo)
           VALUES ($1, $2, $3, $4, $5, $6, 'PERMITIDO', $7)`,
          [
            req.user.email,
            req.user.rol,
            req.user.departamento,
            req.originalUrl,
            req.method,
            req.ip || '127.0.0.1',
            req.auditReason || 'Operación realizada con éxito'
          ]
        );
      } catch (error) {
        console.error('Error guardando log de auditoría:', error);
      }
    }
  });
  next();
};