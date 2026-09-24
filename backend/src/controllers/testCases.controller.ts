import { Request, Response } from 'express';
import { Usuario, Documento, ContextoPeticion } from '../types/security.types';
import { evaluarAcceso } from '../policies/evaluator';

export const ejecutarCasosPrueba = (req: Request, res: Response) => {
  const testSuite = [
    // --- 12 CASOS OBLIGATORIOS ---
    {
      id: 1,
      escenario: 'Empleado consulta documento de su área',
      usuario: { id: 1, nombre: 'Juan', email: 'juan@sec.com', rol: 'EMPLEADO', departamento: 'FINANZAS', clearance: 3, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'FINANZAS', nivelRequerido: 2, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 10, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 2,
      escenario: 'Empleado consulta documento de otra área',
      usuario: { id: 1, nombre: 'Juan', email: 'juan@sec.com', rol: 'EMPLEADO', departamento: 'FINANZAS', clearance: 3, activo: true } as Usuario,
      doc: { id: 102, titulo: 'Nómina', departamento: 'RECURSOS_HUMANOS', nivelRequerido: 2, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 10, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 3,
      escenario: 'Supervisor aprueba documento de su área',
      usuario: { id: 2, nombre: 'Marta', email: 'marta@sec.com', rol: 'SUPERVISOR', departamento: 'FINANZAS', clearance: 4, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'FINANZAS', nivelRequerido: 3, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'APPROVE' as const,
      contexto: { hora: 11, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 4,
      escenario: 'Empleado intenta aprobar documento',
      usuario: { id: 1, nombre: 'Juan', email: 'juan@sec.com', rol: 'EMPLEADO', departamento: 'FINANZAS', clearance: 3, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'FINANZAS', nivelRequerido: 2, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'APPROVE' as const,
      contexto: { hora: 10, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 5,
      escenario: 'Usuario nivel 2 consulta documento nivel 4',
      usuario: { id: 3, nombre: 'Pedro', email: 'pedro@sec.com', rol: 'EMPLEADO', departamento: 'FINANZAS', clearance: 2, activo: true } as Usuario,
      doc: { id: 103, titulo: 'Estrategia', departamento: 'FINANZAS', nivelRequerido: 4, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 12, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 6,
      escenario: 'Gerente elimina documento',
      usuario: { id: 4, nombre: 'Carlos', email: 'carlos@sec.com', rol: 'GERENTE', departamento: 'GENERAL', clearance: 5, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'GENERAL', nivelRequerido: 1, clasificacion: 'PUBLICO' } as Documento,
      accion: 'DELETE' as const,
      contexto: { hora: 14, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 7,
      escenario: 'Auditor intenta modificar documento',
      usuario: { id: 5, nombre: 'Ana', email: 'ana@sec.com', rol: 'AUDITOR', departamento: 'GENERAL', clearance: 5, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'GENERAL', nivelRequerido: 1, clasificacion: 'PUBLICO' } as Documento,
      accion: 'UPDATE' as const,
      contexto: { hora: 15, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 8,
      escenario: 'Usuario inactivo intenta acceder',
      usuario: { id: 6, nombre: 'Luis', email: 'luis@sec.com', rol: 'EMPLEADO', departamento: 'FINANZAS', clearance: 3, activo: false } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'FINANZAS', nivelRequerido: 1, clasificacion: 'PUBLICO' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 10, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 9,
      escenario: 'Documento confidencial accedido fuera de horario',
      usuario: { id: 1, nombre: 'Juan', email: 'juan@sec.com', rol: 'EMPLEADO', departamento: 'FINANZAS', clearance: 3, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'FINANZAS', nivelRequerido: 2, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 23, esDispositivoCorporativo: true } as ContextoPeticion // 11 PM
    },
    {
      id: 10,
      escenario: 'Documento nivel 5 accedido desde dispositivo personal',
      usuario: { id: 4, nombre: 'Carlos', email: 'carlos@sec.com', rol: 'GERENTE', departamento: 'GENERAL', clearance: 5, activo: true } as Usuario,
      doc: { id: 105, titulo: 'Secreto Comercial', departamento: 'GENERAL', nivelRequerido: 5, clasificacion: 'ALTAMENTE_CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 10, esDispositivoCorporativo: false } as ContextoPeticion // Personal
    },
    {
      id: 11,
      escenario: 'Invitado accede a documento público',
      usuario: { id: 7, nombre: 'Guest', email: 'invitado@sec.com', rol: 'INVITADO', departamento: 'GENERAL', clearance: 1, activo: true } as Usuario,
      doc: { id: 100, titulo: 'Políticas Públicas', departamento: 'GENERAL', nivelRequerido: 1, clasificacion: 'PUBLICO' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 10, esDispositivoCorporativo: false } as ContextoPeticion
    },
    {
      id: 12,
      escenario: 'Invitado accede a documento confidencial',
      usuario: { id: 7, nombre: 'Guest', email: 'invitado@sec.com', rol: 'INVITADO', departamento: 'GENERAL', clearance: 1, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'FINANZAS', nivelRequerido: 2, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 10, esDispositivoCorporativo: false } as ContextoPeticion
    },

    // --- 5 CASOS DE PRUEBA ADICIONALES ---
    {
      id: 13,
      escenario: 'Empleado intenta eliminar un documento de su área',
      usuario: { id: 1, nombre: 'Juan', email: 'juan@sec.com', rol: 'EMPLEADO', departamento: 'FINANZAS', clearance: 3, activo: true } as Usuario,
      doc: { id: 101, titulo: 'Reporte', departamento: 'FINANZAS', nivelRequerido: 2, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'DELETE' as const,
      contexto: { hora: 10, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 14,
      escenario: 'Supervisor intenta aprobar documento fuera de su área',
      usuario: { id: 2, nombre: 'Marta', email: 'marta@sec.com', rol: 'SUPERVISOR', departamento: 'FINANZAS', clearance: 4, activo: true } as Usuario,
      doc: { id: 102, titulo: 'Nómina', departamento: 'RECURSOS_HUMANOS', nivelRequerido: 2, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'APPROVE' as const,
      contexto: { hora: 10, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 15,
      escenario: 'Auditor consulta cualquier documento del sistema',
      usuario: { id: 5, nombre: 'Ana', email: 'ana@sec.com', rol: 'AUDITOR', departamento: 'GENERAL', clearance: 5, activo: true } as Usuario,
      doc: { id: 102, titulo: 'Nómina', departamento: 'RECURSOS_HUMANOS', nivelRequerido: 3, clasificacion: 'CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 10, esDispositivoCorporativo: true } as ContextoPeticion
    },
    {
      id: 16,
      escenario: 'Invitado intenta crear un nuevo documento',
      usuario: { id: 7, nombre: 'Guest', email: 'invitado@sec.com', rol: 'INVITADO', departamento: 'GENERAL', clearance: 1, activo: true } as Usuario,
      doc: { id: 200, titulo: 'Borrador', departamento: 'GENERAL', nivelRequerido: 1, clasificacion: 'PUBLICO' } as Documento,
      accion: 'CREATE' as const,
      contexto: { hora: 10, esDispositivoCorporativo: false } as ContextoPeticion
    },
    {
      id: 17,
      escenario: 'Gerente accede a documento nivel 5 desde dispositivo corporativo en horario',
      usuario: { id: 4, nombre: 'Carlos', email: 'carlos@sec.com', rol: 'GERENTE', departamento: 'GENERAL', clearance: 5, activo: true } as Usuario,
      doc: { id: 105, titulo: 'Secreto Comercial', departamento: 'GENERAL', nivelRequerido: 5, clasificacion: 'ALTAMENTE_CONFIDENCIAL' } as Documento,
      accion: 'READ' as const,
      contexto: { hora: 11, esDispositivoCorporativo: true } as ContextoPeticion
    }
  ];

  const resultados = testSuite.map(tc => {
    const evalRes = evaluarAcceso(tc.usuario, tc.doc, tc.accion, tc.contexto);
    return {
      caso: tc.id,
      escenario: tc.escenario,
      resultadoObtenido: evalRes.permitido ? 'PERMITIDO' : 'DENEGADO',
      motivo: evalRes.motivo
    };
  });

  return res.json({
    totalCasos: resultados.length,
    casos: resultados
  });
};