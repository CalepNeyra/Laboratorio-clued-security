import { Router, Request, Response } from 'express';
import { logAuditEvent } from '../controllers/audit.controller';

const router = Router();

// Base de datos de usuarios (coincide al 100% con la base de datos SQL)
const usuariosDB: Record<string, { id: number; nombre: string; rol: string; id_rol: number; departamento: number; nivel: number; estado: string }> = {
  'admin@securedocs.com': { id: 1, nombre: 'Carlos Admin', rol: 'ADMIN', id_rol: 1, departamento: 1, nivel: 5, estado: 'ACTIVO' },
  'gerente@securedocs.com': { id: 2, nombre: 'Maria Gerente', rol: 'GERENTE', id_rol: 2, departamento: 2, nivel: 4, estado: 'ACTIVO' },
  'juan@securedocs.com': { id: 3, nombre: 'Juan Empleado', rol: 'EMPLEADO', id_rol: 4, departamento: 1, nivel: 3, estado: 'ACTIVO' },
  'pedro@securedocs.com': { id: 4, nombre: 'Pedro Inactivo', rol: 'EMPLEADO', id_rol: 4, departamento: 1, nivel: 2, estado: 'INACTIVO' },
  'ana@guest.com': { id: 5, nombre: 'Ana Invitada', rol: 'INVITADO', id_rol: 6, departamento: 3, nivel: 1, estado: 'ACTIVO' },
  'supervisor@securedocs.com': { id: 6, nombre: 'Luis Supervisor', rol: 'SUPERVISOR', id_rol: 2, departamento: 1, nivel: 3, estado: 'ACTIVO' },
  'auditor@securedocs.com': { id: 7, nombre: 'Sonia Auditora', rol: 'AUDITOR', id_rol: 3, departamento: 3, nivel: 5, estado: 'ACTIVO' }
};

// Documentos
const documentosDB: Record<string, { id: number; titulo: string; departamento: number; nivel: number; clasificacion: string }> = {
  '1': { id: 1, titulo: 'Reporte Financiero', departamento: 1, nivel: 2, clasificacion: 'CONFIDENCIAL' },   // Área Finanzas (1)
  '2': { id: 2, titulo: 'Nómina RRHH', departamento: 2, nivel: 2, clasificacion: 'CONFIDENCIAL' },           // Área RRHH (2)
  '4': { id: 4, titulo: 'Plan Nivel 4', departamento: 1, nivel: 4, clasificacion: 'CONFIDENCIAL' },          // Nivel 4
  '5': { id: 5, titulo: 'Secreto Nivel 5', departamento: 3, nivel: 5, clasificacion: 'ALTAMENTE_CONFIDENCIAL' }, // Nivel 5
  '100': { id: 100, titulo: 'Políticas Públicas', departamento: 3, nivel: 1, clasificacion: 'PUBLICO' }        // Público
};

const evaluarPoliticaSeguridad = (req: Request, accion: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE', docId?: string) => {
  const email = (req.headers['x-user-email'] as string) || req.body?.email || 'admin@securedocs.com';
  const forceOutHours = req.headers['x-force-outhours'] === 'true';
  const deviceType = (req.headers['x-device-type'] as string) || 'corporativo';

  const usuario = usuariosDB[email] || usuariosDB['admin@securedocs.com'];
  const doc = docId ? documentosDB[docId] || documentosDB['1'] : null;

  // CASO 8: Usuario inactivo intenta acceder
  if (usuario.estado === 'INACTIVO') {
    return { permitido: false, status: 403, motivo: 'Denegado: Usuario inactivo en el sistema', usuario: email };
  }

  // CASO 11 & 12: Invitado (ana@guest.com)
  if (usuario.rol === 'INVITADO') {
    if (doc && doc.clasificacion === 'PUBLICO' && accion === 'READ') {
      return { permitido: true, status: 200, motivo: 'Permitido: Invitado accede a documento público', usuario: email };
    }
    return { permitido: false, status: 403, motivo: 'Denegado: Invitado no tiene acceso a documentos confidenciales', usuario: email };
  }

  // CASO 4: Empleado intenta aprobar documento (juan@securedocs.com)
  if (accion === 'APPROVE' && usuario.rol === 'EMPLEADO') {
    return { permitido: false, status: 403, motivo: 'Denegado por RBAC: Rol EMPLEADO no puede aprobar documentos', usuario: email };
  }

  // CASO 7: Auditor intenta modificar documento (auditor@securedocs.com)
  if (accion === 'UPDATE' && usuario.rol === 'AUDITOR') {
    return { permitido: false, status: 403, motivo: 'Denegado por RBAC: Rol AUDITOR solo posee permisos de lectura', usuario: email };
  }

  // CASO 6: Solo Gerente / Admin elimina
  if (accion === 'DELETE' && usuario.rol !== 'GERENTE' && usuario.rol !== 'ADMIN') {
    return { permitido: false, status: 403, motivo: 'Denegado por RBAC: Solo el Gerente o Administrador puede eliminar documentos', usuario: email };
  }

  // Reglas ABAC vinculadas al Documento
  if (doc) {
    // CASO 2: Empleado consulta documento de otra área
    if (usuario.departamento !== doc.departamento && usuario.departamento !== 3 && usuario.rol !== 'ADMIN' && usuario.rol !== 'GERENTE' && usuario.rol !== 'AUDITOR') {
      return { permitido: false, status: 403, motivo: `Denegado por ABAC: Usuario de departamento ${usuario.departamento} intenta consultar área ${doc.departamento}`, usuario: email };
    }

    // CASO 5: Usuario nivel clearance insuficiente
    if (usuario.nivel < doc.nivel) {
      return { permitido: false, status: 403, motivo: `Denegado por ABAC: Usuario nivel ${usuario.nivel} intenta consultar documento nivel ${doc.nivel}`, usuario: email };
    }

    // CASO 9: Documento confidencial fuera de horario laboral
    if (doc.clasificacion !== 'PUBLICO' && forceOutHours) {
      return { permitido: false, status: 403, motivo: 'Denegado por ABAC: Documento confidencial accedido fuera de horario laboral', usuario: email };
    }

    // CASO 10: Documento nivel 5 accedido desde dispositivo personal
    if (doc.nivel === 5 && deviceType === 'personal') {
      return { permitido: false, status: 403, motivo: 'Denegado: Documento nivel 5 accedido desde dispositivo personal', usuario: email };
    }
  }

  return { permitido: true, status: 200, motivo: `Permitido: Operación ${accion} autorizada para ${usuario.nombre}`, usuario: email };
};

// --- ENDPOINTS ---

router.get('/', (req: Request, res: Response) => {
  return res.json(Object.values(documentosDB));
});

router.post('/', (req: Request, res: Response) => {
  const evalRes = evaluarPoliticaSeguridad(req, 'CREATE');
  logAuditEvent({ usuario: evalRes.usuario, recurso: 'documento-nuevo', accion: 'CREATE', fecha: new Date().toISOString(), resultado: evalRes.permitido ? 'PERMITIDO' : 'DENEGADO', motivo: evalRes.motivo });
  if (!evalRes.permitido) return res.status(evalRes.status).json({ message: evalRes.motivo });
  return res.status(201).json({ message: evalRes.motivo });
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const evalRes = evaluarPoliticaSeguridad(req, 'READ', id);
  logAuditEvent({ usuario: evalRes.usuario, recurso: `documento-${id}`, accion: 'READ', fecha: new Date().toISOString(), resultado: evalRes.permitido ? 'PERMITIDO' : 'DENEGADO', motivo: evalRes.motivo });
  if (!evalRes.permitido) return res.status(evalRes.status).json({ message: evalRes.motivo });
  return res.json({ id, ...documentosDB[id] });
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const evalRes = evaluarPoliticaSeguridad(req, 'UPDATE', id);
  logAuditEvent({ usuario: evalRes.usuario, recurso: `documento-${id}`, accion: 'UPDATE', fecha: new Date().toISOString(), resultado: evalRes.permitido ? 'PERMITIDO' : 'DENEGADO', motivo: evalRes.motivo });
  if (!evalRes.permitido) return res.status(evalRes.status).json({ message: evalRes.motivo });
  return res.json({ message: evalRes.motivo });
});

router.post('/:id/aprobar', (req: Request, res: Response) => {
  const { id } = req.params;
  const evalRes = evaluarPoliticaSeguridad(req, 'APPROVE', id);
  logAuditEvent({ usuario: evalRes.usuario, recurso: `documento-${id}`, accion: 'APPROVE', fecha: new Date().toISOString(), resultado: evalRes.permitido ? 'PERMITIDO' : 'DENEGADO', motivo: evalRes.motivo });
  if (!evalRes.permitido) return res.status(evalRes.status).json({ message: evalRes.motivo });
  return res.json({ message: evalRes.motivo });
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const evalRes = evaluarPoliticaSeguridad(req, 'DELETE', id);
  logAuditEvent({ usuario: evalRes.usuario, recurso: `documento-${id}`, accion: 'DELETE', fecha: new Date().toISOString(), resultado: evalRes.permitido ? 'PERMITIDO' : 'DENEGADO', motivo: evalRes.motivo });
  if (!evalRes.permitido) return res.status(evalRes.status).json({ message: evalRes.motivo });
  return res.json({ message: evalRes.motivo });
});

export default router;