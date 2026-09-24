export interface AuditRecord {
  usuario: string;
  recurso: string;
  accion: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'LOGIN';
  fecha: string;
  resultado: 'PERMITIDO' | 'DENEGADO';
  motivo: string;
}