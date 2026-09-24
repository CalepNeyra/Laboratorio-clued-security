import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ABACPolicyEngine, EnvironmentAttributes } from '../policies/abacEngine';
import { pool } from '../config/database';

export const checkABAC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'No autenticado' });

    const docId = req.params.id;
    let resource = req.body;

    if (docId) {
      const docResult = await pool.query(
        `SELECT d.*, dep.nombre as departamento 
         FROM documentos d 
         JOIN departamentos dep ON d.id_departamento = dep.id 
         WHERE d.id = $1`,
        [docId]
      );

      if (docResult.rows.length === 0) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      resource = docResult.rows[0];
    }

    const now = new Date();
    const environment: EnvironmentAttributes = {
      hora: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      fecha: now.toISOString().split('T')[0],
      direccion_ip: (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
      ubicacion: (req.headers['x-user-location'] as string) || user.pais || 'PERU',
      dispositivo: ((req.headers['x-device-type'] as string)?.toUpperCase() === 'CORPORATIVO') ? 'CORPORATIVO' : 'PERSONAL'
    };

    const actionMap: Record<string, 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE'> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
      PATCH: 'APPROVE'
    };

    const evaluation = ABACPolicyEngine.evaluate({
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        departamento: user.departamento,
        nivel_seguridad: user.nivel_seguridad,
        pais: user.pais,
        tipo_contrato: user.tipo_contrato,
        estado: user.estado
      },
      recurso: {
        id: resource.id,
        titulo: resource.titulo,
        departamento: resource.departamento,
        nivel_confidencialidad: resource.nivel_confidencialidad,
        estado: resource.estado,
        pais: resource.pais,
        propietario_id: resource.propietario_id
      },
      entorno: environment,
      accion: actionMap[req.method] || 'READ'
    });

    console.log(`PASO 2 — ABAC`);
    console.log(`Evaluando Políticas:`);
    console.log(`- Depto: ${user.departamento} vs ${resource.departamento}`);
    console.log(`- Nivel Seguridad: ${user.nivel_seguridad} >= Confidencialidad: ${resource.nivel_confidencialidad}`);
    console.log(`- Entorno: Hora=${environment.hora}, Ubicación=${environment.ubicacion}, Dispositivo=${environment.dispositivo}`);

    if (!evaluation.allowed) {
      console.log(`-> ABAC = DENEGADO (${evaluation.reason})`);
      console.log(`RESULTADO FINAL: ACCESO DENEGADO`);
      console.log(`==================================================\n`);

      await pool.query(
        `INSERT INTO auditoria (usuario_email, rol, departamento_usuario, recurso, accion, ip_origen, resultado, motivo)
         VALUES ($1, $2, $3, $4, $5, $6, 'DENEGADO', $7)`,
        [user.email, user.rol, user.departamento, req.originalUrl, req.method, environment.direccion_ip, evaluation.reason]
      );

      return res.status(403).json({
        message: 'Acceso Denegado por Política ABAC',
        motivo: evaluation.reason
      });
    }

    console.log(`-> ABAC = PERMITIDO`);
    console.log(`RESULTADO FINAL: ACCESO AUTORIZADO`);
    console.log(`==================================================\n`);

    await pool.query(
      `INSERT INTO auditoria (usuario_email, rol, departamento_usuario, recurso, accion, ip_origen, resultado, motivo)
       VALUES ($1, $2, $3, $4, $5, $6, 'PERMITIDO', $7)`,
      [user.email, user.rol, user.departamento, req.originalUrl, req.method, environment.direccion_ip, 'Acceso Autorizado por RBAC + ABAC']
    );

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error en la evaluación ABAC', error });
  }
};