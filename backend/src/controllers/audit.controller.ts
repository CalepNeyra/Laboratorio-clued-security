import { Request, Response } from 'express';
import { AuditRecord } from '../types/audit.types';

// Historial global inicializado con los 12 casos obligatorios + 5 adicionales
export const auditLogs: AuditRecord[] = [
  // --- 12 CASOS OBLIGATORIOS ---
  {
    usuario: "juan.empleado@empresa.com",
    recurso: "documento-101",
    accion: "READ",
    fecha: "2026-09-23T09:00:00",
    resultado: "PERMITIDO",
    motivo: "Empleado consulta documento de su área (Finanzas)"
  },
  {
    usuario: "juan.empleado@empresa.com",
    recurso: "documento-201",
    accion: "READ",
    fecha: "2026-09-23T09:05:00",
    resultado: "DENEGADO",
    motivo: "Empleado consulta documento de otra área (RRHH)"
  },
  {
    usuario: "marta.supervisor@empresa.com",
    recurso: "documento-102",
    accion: "APPROVE",
    fecha: "2026-09-23T09:10:00",
    resultado: "PERMITIDO",
    motivo: "Supervisor aprueba documento de su área (Finanzas)"
  },
  {
    usuario: "juan.empleado@empresa.com",
    recurso: "documento-102",
    accion: "APPROVE",
    fecha: "2026-09-23T09:15:00",
    resultado: "DENEGADO",
    motivo: "Denegado por RBAC: Rol EMPLEADO no posee permisos de aprobación"
  },
  {
    usuario: "pedro.nivel2@empresa.com",
    recurso: "documento-401",
    accion: "READ",
    fecha: "2026-09-23T09:20:00",
    resultado: "DENEGADO",
    motivo: "Denegado por ABAC: Usuario clearance nivel 2 intenta acceder a documento nivel 4"
  },
  {
    usuario: "carlos.gerente@empresa.com",
    recurso: "documento-103",
    accion: "DELETE",
    fecha: "2026-09-23T09:25:00",
    resultado: "PERMITIDO",
    motivo: "Gerente elimina documento"
  },
  {
    usuario: "ana.auditor@empresa.com",
    recurso: "documento-101",
    accion: "UPDATE",
    fecha: "2026-09-23T09:30:00",
    resultado: "DENEGADO",
    motivo: "Denegado por RBAC: Rol AUDITOR solo posee permisos de lectura"
  },
  {
    usuario: "luis.inactivo@empresa.com",
    recurso: "documento-101",
    accion: "READ",
    fecha: "2026-09-23T09:35:00",
    resultado: "DENEGADO",
    motivo: "Usuario inactivo en el sistema"
  },
  {
    usuario: "juan.empleado@empresa.com",
    recurso: "documento-501",
    accion: "READ",
    fecha: "2026-09-23T23:00:00",
    resultado: "DENEGADO",
    motivo: "Denegado por ABAC: Documento confidencial accedido fuera de horario laboral"
  },
  {
    usuario: "carlos.gerente@empresa.com",
    recurso: "documento-502",
    accion: "READ",
    fecha: "2026-09-23T10:00:00",
    resultado: "DENEGADO",
    motivo: "Documento nivel 5 accedido desde dispositivo personal"
  },
  {
    usuario: "invitado@empresa.com",
    recurso: "documento-001",
    accion: "READ",
    fecha: "2026-09-23T10:05:00",
    resultado: "PERMITIDO",
    motivo: "Invitado accede a documento público"
  },
  {
    usuario: "invitado@empresa.com",
    recurso: "documento-501",
    accion: "READ",
    fecha: "2026-09-23T10:10:00",
    resultado: "DENEGADO",
    motivo: "Invitado intenta acceder a documento confidencial"
  },

  // --- 5 CASOS ADICIONALES ---
  {
    usuario: "juan.empleado@empresa.com",
    recurso: "documento-101",
    accion: "DELETE",
    fecha: "2026-09-23T10:15:00",
    resultado: "DENEGADO",
    motivo: "Denegado por RBAC: Empleado intenta eliminar un documento"
  },
  {
    usuario: "marta.supervisor@empresa.com",
    recurso: "documento-201",
    accion: "APPROVE",
    fecha: "2026-09-23T10:20:00",
    resultado: "DENEGADO",
    motivo: "Denegado por ABAC: Supervisor intenta aprobar documento fuera de su área"
  },
  {
    usuario: "ana.auditor@empresa.com",
    recurso: "documento-201",
    accion: "READ",
    fecha: "2026-09-23T10:25:00",
    resultado: "PERMITIDO",
    motivo: "Auditor consulta documento de cualquier área del sistema"
  },
  {
    usuario: "invitado@empresa.com",
    recurso: "documento-999",
    accion: "CREATE",
    fecha: "2026-09-23T10:30:00",
    resultado: "DENEGADO",
    motivo: "Denegado por RBAC: Invitado intenta crear un documento"
  },
  {
    usuario: "carlos.gerente@empresa.com",
    recurso: "documento-502",
    accion: "READ",
    fecha: "2026-09-23T11:00:00",
    resultado: "PERMITIDO",
    motivo: "Gerente accede a documento nivel 5 desde dispositivo corporativo en horario laboral"
  }
];

// Helper para registrar nuevas trazas dinámicamente
export const logAuditEvent = (event: AuditRecord) => {
  auditLogs.unshift(event);
};

// Handler del endpoint GET /api/auditoria
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(auditLogs);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al consultar el registro de auditoría',
      error: error instanceof Error ? error.message : error
    });
  }
};