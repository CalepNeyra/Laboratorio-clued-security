import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { getDB } from '../config/database';

export const auditLogger = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const usuario = req.user ? req.user.nombre : 'ANONIMO';
  const recurso = req.originalUrl;
  const accion = req.method;

  res.on('finish', async () => {
    try {
      const db = await getDB();
      const resultado = res.statusCode < 400 ? 'PERMITIDO' : 'DENEGADO';
      const motivo = `Respuesta con status code ${res.statusCode}`;

      await db.run(
        `INSERT INTO auditoria (usuario, recurso, accion, resultado, motivo) VALUES (?, ?, ?, ?, ?)`,
        [usuario, recurso, accion, resultado, motivo]
      );
    } catch (err) {
      console.error('Error guardando registro de auditoria:', err);
    }
  });

  next();
};