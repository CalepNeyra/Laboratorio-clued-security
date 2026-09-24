export type Rol = 'EMPLEADO' | 'SUPERVISOR' | 'GERENTE' | 'AUDITOR' | 'INVITADO';
export type Departamento = 'FINANZAS' | 'RECURSOS_HUMANOS' | 'IT' | 'GENERAL';
export type Clasificacion = 'PUBLICO' | 'CONFIDENCIAL' | 'ALTAMENTE_CONFIDENCIAL';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  departamento: Departamento;
  clearance: number; // Ej: Nivel 1 a 5
  activo: boolean;
}

export interface Documento {
  id: number;
  titulo: string;
  departamento: Departamento;
  nivelRequerido: number; // Ej: Nivel 1 a 5
  clasificacion: Clasificacion;
}

export interface ContextoPeticion {
  hora: number; // Formato 24h (ej: 14 para las 2 PM, 22 para las 10 PM)
  esDispositivoCorporativo: boolean; // true = Corporativo, false = Personal
}

export interface RegistroAuditoria {
  usuario: string;
  recurso: string;
  accion: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE';
  fecha: string;
  resultado: 'PERMITIDO' | 'DENEGADO';
  motivo: string;
}