import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { getDB } from '../config/database';

export const checkRBAC = (permisoRequerido: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    try {
      const db = await getDB();
      const query = `
        SELECT p.codigo 
        FROM permisos p
        JOIN rol_permisos rp ON p.id = rp.id_permiso
        JOIN roles r ON r.id = rp.id_rol
        WHERE r.nombre = ? AND p.codigo = ?
      `;

      const result = await db.get(query, [req.user.rol, permisoRequerido]);

      if (!result && req.user.rol !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acceso denegado por RBAC: Rol no posee el permiso' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Error en verificación RBAC', error });
    }
  };
};