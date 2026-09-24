import { Router, Request, Response } from 'express';
import { logAuditEvent } from '../controllers/audit.controller';

const router = Router();

// Base de datos de autenticación
const usuariosAuth: Record<string, { email: string; nombre: string; rol: string; id_rol: number; departamento: number; nivel: number; estado: string }> = {
  'admin@securedocs.com': { email: 'admin@securedocs.com', nombre: 'Carlos Admin', rol: 'ADMIN', id_rol: 1, departamento: 1, nivel: 5, estado: 'ACTIVO' },
  'gerente@securedocs.com': { email: 'gerente@securedocs.com', nombre: 'Maria Gerente', rol: 'GERENTE', id_rol: 2, departamento: 2, nivel: 4, estado: 'ACTIVO' },
  'juan@securedocs.com': { email: 'juan@securedocs.com', nombre: 'Juan Empleado', rol: 'EMPLEADO', id_rol: 4, departamento: 1, nivel: 3, estado: 'ACTIVO' },
  'pedro@securedocs.com': { email: 'pedro@securedocs.com', nombre: 'Pedro Inactivo', rol: 'EMPLEADO', id_rol: 4, departamento: 1, nivel: 2, estado: 'INACTIVO' },
  'ana@guest.com': { email: 'ana@guest.com', nombre: 'Ana Invitada', rol: 'INVITADO', id_rol: 6, departamento: 3, nivel: 1, estado: 'ACTIVO' },
  'supervisor@securedocs.com': { email: 'supervisor@securedocs.com', nombre: 'Luis Supervisor', rol: 'SUPERVISOR', id_rol: 2, departamento: 1, nivel: 3, estado: 'ACTIVO' },
  'auditor@securedocs.com': { email: 'auditor@securedocs.com', nombre: 'Sonia Auditora', rol: 'AUDITOR', id_rol: 3, departamento: 3, nivel: 5, estado: 'ACTIVO' }
};

// Guard de usuario activo para persistir la sesión simulada
export let usuarioSesionActiva = usuariosAuth['admin@securedocs.com'];

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = usuariosAuth[email] || usuariosAuth['admin@securedocs.com'];

  // Guardar en la sesión activa del servidor
  usuarioSesionActiva = user;

  // CASO 8: Usuario inactivo intenta ingresar
  if (user.estado === 'INACTIVO') {
    logAuditEvent({
      usuario: email || 'usuario-inactivo',
      recurso: 'SISTEMA_AUTH',
      accion: 'READ',
      fecha: new Date().toISOString(),
      resultado: 'DENEGADO',
      motivo: 'Denegado: Usuario inactivo intenta acceder al sistema'
    });
    return res.status(403).json({ message: 'Usuario inactivo en el sistema' });
  }

  logAuditEvent({
    usuario: user.email,
    recurso: 'SISTEMA_AUTH',
    accion: 'READ',
    fecha: new Date().toISOString(),
    resultado: 'PERMITIDO',
    motivo: `Inicio de sesión exitoso para ${user.nombre} (${user.rol})`
  });

  return res.json({
    token: `jwt-token-${user.id_rol}-${Date.now()}`,
    user
  });
});

export default router;