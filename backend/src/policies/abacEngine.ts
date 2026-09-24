export interface UserAttributes {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  nivel_seguridad: number;
  pais: string;
  tipo_contrato: 'INTERNO' | 'EXTERNO';
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface ResourceAttributes {
  id?: number;
  titulo?: string;
  departamento: string;
  nivel_confidencialidad: number;
  estado: string;
  pais: string;
  propietario_id: number;
}

export interface EnvironmentAttributes {
  hora: string; // "HH:MM"
  fecha: string;
  direccion_ip: string;
  ubicacion: string;
  dispositivo: 'CORPORATIVO' | 'PERSONAL';
}

export interface ABACContext {
  usuario: UserAttributes;
  recurso: ResourceAttributes;
  entorno: EnvironmentAttributes;
  accion: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE';
}

type PolicyRule = (ctx: ABACContext) => { allowed: boolean; reason?: string };

export class ABACPolicyEngine {
  private static policies: PolicyRule[] = [
    // POLÍTICA 7: Estado del usuario
    (ctx) => ({
      allowed: ctx.usuario.estado === 'ACTIVO',
      reason: 'El usuario se encuentra inactivo o suspendido'
    }),

    // POLÍTICA 8: Regla para Invitados
    (ctx) => {
      if (ctx.usuario.rol === 'INVITADO') {
        const isExternal = ctx.usuario.tipo_contrato === 'EXTERNO';
        const isPublicLevel = ctx.recurso.nivel_confidencialidad <= 1;
        const isPublished = ctx.recurso.estado === 'PUBLICADO';
        const ok = isExternal && isPublicLevel && isPublished;
        return {
          allowed: ok,
          reason: ok ? undefined : 'Invitado denegado: debe ser EXTERNO, documento nivel <= 1 y estar PUBLICADO'
        };
      }
      return { allowed: true };
    },

    // POLÍTICA 1: Departamento
    (ctx) => {
      if (['ADMINISTRADOR', 'GERENTE', 'AUDITOR'].includes(ctx.usuario.rol)) return { allowed: true };
      const sameDept = ctx.usuario.departamento === ctx.recurso.departamento;
      return {
        allowed: sameDept,
        reason: `Departamento del usuario (${ctx.usuario.departamento}) no coincide con el recurso (${ctx.recurso.departamento})`
      };
    },

    // POLÍTICA 2: Nivel de seguridad
    (ctx) => {
      const isLevelOk = ctx.usuario.nivel_seguridad >= ctx.recurso.nivel_confidencialidad;
      return {
        allowed: isLevelOk,
        reason: `Nivel de seguridad insuficiente (${ctx.usuario.nivel_seguridad} < ${ctx.recurso.nivel_confidencialidad})`
      };
    },

    // POLÍTICA 3: Propiedad (Modificación)
    (ctx) => {
      if (ctx.accion === 'UPDATE') {
        if (['ADMINISTRADOR', 'GERENTE'].includes(ctx.usuario.rol)) return { allowed: true };
        const isOwner = ctx.usuario.id === ctx.recurso.propietario_id;
        return {
          allowed: isOwner,
          reason: 'Solo el propietario del documento puede modificarlo'
        };
      }
      return { allowed: true };
    },

    // POLÍTICA 4: Horario para documentos altamente confidenciales
    (ctx) => {
      if (ctx.recurso.nivel_confidencialidad >= 4) {
        const hour = parseInt(ctx.entorno.hora.split(':')[0], 10);
        const inSchedule = hour >= 8 && hour < 18;
        return {
          allowed: inSchedule,
          reason: 'Acceso a documento altamente confidencial fuera del horario permitido (08:00 - 18:00)'
        };
      }
      return { allowed: true };
    },

    // POLÍTICA 5: Restricción por País
    (ctx) => {
      if (ctx.recurso.pais === 'PERU') {
        const isPeru = ctx.entorno.ubicacion === 'PERU' && ctx.usuario.pais === 'PERU';
        return {
          allowed: isPeru,
          reason: 'Documentos de Perú solo se pueden consultar desde Perú'
        };
      }
      return { allowed: true };
    },

    // POLÍTICA 6: Restricción por Dispositivo
    (ctx) => {
      if (ctx.recurso.nivel_confidencialidad >= 4) {
        const isCorporate = ctx.entorno.dispositivo === 'CORPORATIVO';
        return {
          allowed: isCorporate,
          reason: 'Documentos con confidencialidad 4 o 5 solo se permiten desde dispositivos corporativos'
        };
      }
      return { allowed: true };
    }
  ];

  public static evaluate(ctx: ABACContext): { allowed: boolean; reason?: string } {
    for (const policy of this.policies) {
      const result = policy(ctx);
      if (!result.allowed) {
        return result; // Devuelve la primera regla incumplida con su motivo exacto
      }
    }
    return { allowed: true, reason: 'Acceso Autorizado por ABAC' };
  }
}