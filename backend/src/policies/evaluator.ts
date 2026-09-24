import { Usuario, Documento, ContextoPeticion, RegistroAuditoria } from '../types/security.types';
import { logAuditEvent } from '../controllers/audit.controller';

export function evaluarAcceso(
  usuario: Usuario,
  documento: Documento,
  accion: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE',
  contexto: ContextoPeticion
): { permitido: boolean; motivo: string } {
  const fecha = new Date().toISOString();
  const recurso = `documento-${documento.id}`;

  const registrar = (permitido: boolean, motivo: string) => {
    const resultado: 'PERMITIDO' | 'DENEGADO' = permitido ? 'PERMITIDO' : 'DENEGADO';
    logAuditEvent({
      usuario: usuario.email,
      recurso,
      accion,
      fecha,
      resultado,
      motivo
    });
    return { permitido, motivo };
  };

  // REGLA 8: Usuario inactivo intenta acceder
  if (!usuario.activo) {
    return registrar(false, 'Usuario inactivo en el sistema');
  }

  // REGLA 11 & 12: Permisos para INVITADO
  if (usuario.rol === 'INVITADO') {
    if (documento.clasificacion === 'PUBLICO' && accion === 'READ') {
      return registrar(true, 'Invitado accede a documento público');
    }
    return registrar(false, 'Invitado no tiene acceso a documentos confidenciales o acciones de escritura');
  }

  // REGLAS RBAC SEGÚN ACCIÓN Y ROL
  if (accion === 'APPROVE') {
    // REGLA 4: Empleado intenta aprobar documento
    if (usuario.rol === 'EMPLEADO') {
      return registrar(false, 'DENEGADO por RBAC: Rol EMPLEADO no puede aprobar documentos');
    }
  }

  if (accion === 'UPDATE') {
    // REGLA 7: Auditor intenta modificar documento
    if (usuario.rol === 'AUDITOR') {
      return registrar(false, 'DENEGADO por RBAC: Rol AUDITOR solo posee permisos de lectura');
    }
  }

  if (accion === 'DELETE') {
    // REGLA 6: Gerente elimina documento
    if (usuario.rol !== 'GERENTE') {
      return registrar(false, 'DENEGADO por RBAC: Solo el GERENTE puede eliminar documentos');
    }
  }

  // REGLA 1 & 2: Validación por área / departamento (ABAC)
  if (usuario.departamento !== documento.departamento && usuario.departamento !== 'GENERAL') {
    return registrar(false, `DENEGADO por ABAC: Documento pertenece al área ${documento.departamento} y el usuario es de ${usuario.departamento}`);
  }

  // REGLA 5: Validación de Nivel de Clearance (ABAC)
  if (usuario.clearance < documento.nivelRequerido) {
    return registrar(false, `DENEGADO por ABAC: Nivel de seguridad insuficiente (Usuario Nivel ${usuario.clearance} vs Documento Nivel ${documento.nivelRequerido})`);
  }

  // REGLA 9: Documento confidencial fuera de horario (ABAC)
  const esHorarioLaboral = contexto.hora >= 8 && contexto.hora <= 18;
  if (documento.clasificacion !== 'PUBLICO' && !esHorarioLaboral) {
    return registrar(false, 'DENEGADO por ABAC: Acceso a documento confidencial fuera de horario laboral');
  }

  // REGLA 10: Documento Nivel 5 desde dispositivo personal (ABAC)
  if (documento.nivelRequerido >= 5 && !contexto.esDispositivoCorporativo) {
    return registrar(false, 'DENEGADO por ABAC: Documento nivel 5 requiere dispositivo corporativo');
  }

  // Si supera todos los controles:
  return registrar(true, 'Acceso permitido tras evaluación exitosa de RBAC y ABAC');
}