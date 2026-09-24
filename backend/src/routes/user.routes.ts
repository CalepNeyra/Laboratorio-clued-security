import { Router, Request, Response } from 'express';
import { logAuditEvent } from '../controllers/audit.controller';

const router = Router();

// GET /api/usuarios (Obtener lista de usuarios)
router.get('/', (req: Request, res: Response) => {
  const usuarios = [
    { id: 1, nombre: 'Carlos Admin', email: 'admin@securedocs.com', rol: 'ADMIN', departamento: 'FINANZAS', nivel: 5, estado: 'ACTIVO' },
    { id: 2, nombre: 'Maria Gerente', email: 'gerente@securedocs.com', rol: 'GERENTE', departamento: 'RRHH', nivel: 4, estado: 'ACTIVO' },
    { id: 3, nombre: 'Juan Empleado', email: 'juan@securedocs.com', rol: 'EMPLEADO', departamento: 'FINANZAS', nivel: 3, estado: 'ACTIVO' },
    { id: 4, nombre: 'Pedro Inactivo', email: 'pedro@securedocs.com', rol: 'EMPLEADO', departamento: 'FINANZAS', nivel: 2, estado: 'INACTIVO' },
    { id: 5, nombre: 'Ana Invitada', email: 'ana@guest.com', rol: 'INVITADO', departamento: 'GENERAL', nivel: 1, estado: 'ACTIVO' }
  ];
  return res.json(usuarios);
});

// POST /api/usuarios (Registrar Nuevo Usuario)
router.post('/', (req: Request, res: Response) => {
  const { nombre, email } = req.body;
  const userEmail = (req.headers['x-user-email'] as string) || 'admin@securedocs.com';

  logAuditEvent({
    usuario: userEmail,
    recurso: 'SISTEMA_USUARIOS',
    accion: 'CREATE',
    fecha: new Date().toISOString(),
    resultado: 'PERMITIDO',
    motivo: `Nuevo usuario registrado: ${email || 'Sin email'}`
  });

  return res.status(201).json({
    message: 'Usuario creado exitosamente',
    usuario: { id: Date.now(), nombre, email, estado: 'ACTIVO' }
  });
});

// PUT /api/usuarios/:id (Actualizar Usuario por ID)
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userEmail = (req.headers['x-user-email'] as string) || 'admin@securedocs.com';

  logAuditEvent({
    usuario: userEmail,
    recurso: `usuario-${id}`,
    accion: 'UPDATE',
    fecha: new Date().toISOString(),
    resultado: 'PERMITIDO',
    motivo: `Actualización de datos del usuario con ID #${id}`
  });

  return res.json({
    message: `Usuario #${id} actualizado correctamente`
  });
});

export default router;