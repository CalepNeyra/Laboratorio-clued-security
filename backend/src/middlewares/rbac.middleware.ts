import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { pool } from '../config/database';

export const checkRBAC = (permisoRequerido: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const rolUsuario = req.user?.rol;

      console.log('==============================================');
      console.log(`EVALUACIÓN DE ACCESO: ${req.method} ${req.originalUrl}`);
      console.log(`PASO 1 - RBAC`);
      console.log(`Usuario: ${req.user?.nombre} | Rol: ${rolUsuario}`);
      console.log(`Permiso requerido: ${permisoRequerido}`);

      if (!rolUsuario) {
        return res.status(403).json({
          message: 'Acceso Denegado por RBAC',
          motivo: 'Usuario no tiene un rol asignado'
        });
      }

      const query = `
        SELECT p.codigo 
        FROM permisos p
        JOIN rol_permisos rp ON p.id = rp.id_permiso
        JOIN roles r ON r.id = rp.id_rol
        WHERE LOWER(TRIM(r.nombre)) = LOWER(TRIM($1))
          AND LOWER(TRIM(p.codigo)) = LOWER(TRIM($2));
      `;

      const result = await pool.query(query, [rolUsuario, permisoRequerido]);

      if (result.rows.length === 0) {
        console.log('-> RBAC = DENEGADO (El rol no tiene asignado el permiso)');
        console.log('RESULTADO FINAL: ACCESO DENEGADO');
        console.log('==============================================');
        return res.status(403).json({
          message: 'Acceso Denegado por RBAC',
          motivo: `El rol ${rolUsuario} no posee el permiso ${permisoRequerido}`
        });
      }

      console.log('-> RBAC = APROBADO');
      next();
    } catch (error) {
      console.error('Error en middleware RBAC:', error);
      return res.status(500).json({ message: 'Error interno de autorización RBAC', error });
    }
  };
};