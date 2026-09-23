import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { getDB } from '../config/database';

export const checkABAC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  // 1. Verificar Estado
  if (user.estado !== 'ACTIVO') {
    return res.status(403).json({
      message: 'Acceso DENEGADO por ABAC',
      motivo: 'El usuario no está ACTIVO.'
    });
  }

  try {
    const db = await getDB();

    // Obtener todos los documentos cruzando el nombre del departamento
    const documentos = await db.all(`
      SELECT d.*, dep.nombre as departamento 
      FROM documentos d
      JOIN departamentos dep ON d.id_departamento = dep.id
    `);

    // Filtrar documentos bajo reglas estrictas ABAC
    const documentosPermitidos = documentos.filter(doc => {
      // Regla 1: Departamento (A menos que sea ADMINISTRADOR)
      const coincideDep = user.rol === 'ADMINISTRADOR' || user.departamento === doc.departamento;

      // Regla 2: Nivel de Seguridad >= Confidencialidad del Documento
      const nivelSuficiente = user.nivel_seguridad >= doc.nivel_confidencialidad;

      // Regla 3: Mismo País
      const coincidePais = user.pais === doc.pais;

      return coincideDep && nivelSuficiente && coincidePais;
    });

    // ¡AQUÍ ESTÁ LA CLAVE! Si no pasa las reglas de ningún documento, RETORNAR 403
    if (documentosPermitidos.length === 0) {
      return res.status(403).json({
        message: 'Acceso DENEGADO por ABAC',
        motivo: `Denegado: Tu departamento (${user.departamento}) o nivel de seguridad (${user.nivel_seguridad}) no satisfacen las políticas del recurso.`,
        evaluacion: {
          departamento_usuario: user.departamento,
          nivel_seguridad_usuario: user.nivel_seguridad,
          politica: 'DENEGADO'
        }
      });
    }

    // Si tiene acceso, guardar la lista filtrada y dar paso
    (req as any).documentosPermitidos = documentosPermitidos;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error en la evaluación ABAC', error });
  }
};