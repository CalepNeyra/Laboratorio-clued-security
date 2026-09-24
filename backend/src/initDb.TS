import { pool } from './config/database';

async function initDB() {
  console.log('Cargando base de datos PostgreSQL con atributos completos (5.1 y 5.2)...');
  const client = await pool.connect();

  try {
    await client.query(`
      DROP TABLE IF EXISTS auditoria CASCADE;
      DROP TABLE IF EXISTS documentos CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;
      DROP TABLE IF EXISTS rol_permisos CASCADE;
      DROP TABLE IF EXISTS permisos CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;
      DROP TABLE IF EXISTS departamentos CASCADE;

      CREATE TABLE departamentos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) UNIQUE NOT NULL
      );

      CREATE TABLE roles (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) UNIQUE NOT NULL
      );

      CREATE TABLE permisos (
          id SERIAL PRIMARY KEY,
          codigo VARCHAR(100) UNIQUE NOT NULL,
          descripcion TEXT
      );

      CREATE TABLE rol_permisos (
          id_rol INT REFERENCES roles(id) ON DELETE CASCADE,
          id_permiso INT REFERENCES permisos(id) ON DELETE CASCADE,
          PRIMARY KEY (id_rol, id_permiso)
      );

      -- 5.1 Atributos del Usuario
      CREATE TABLE usuarios (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          id_rol INT REFERENCES roles(id),
          id_departamento INT REFERENCES departamentos(id),
          nivel_seguridad INT CHECK (nivel_seguridad BETWEEN 1 AND 5),
          pais VARCHAR(50) NOT NULL,
          tipo_contrato VARCHAR(20) CHECK (tipo_contrato IN ('INTERNO', 'EXTERNO')),
          estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO'))
      );

      -- 5.2 Atributos del Recurso (Documento)
      CREATE TABLE documentos (
          id SERIAL PRIMARY KEY,
          titulo VARCHAR(200) NOT NULL,
          descripcion TEXT,
          propietario_id INT REFERENCES usuarios(id),
          id_departamento INT REFERENCES departamentos(id),
          nivel_confidencialidad INT CHECK (nivel_confidencialidad BETWEEN 1 AND 5),
          estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PUBLICADO', 'RECHAZADO')),
          pais VARCHAR(50) NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE auditoria (
          id SERIAL PRIMARY KEY,
          usuario_email VARCHAR(150) NOT NULL,
          rol VARCHAR(50) NOT NULL,
          departamento_usuario VARCHAR(50) NOT NULL,
          recurso TEXT NOT NULL,
          accion VARCHAR(100) NOT NULL,
          ip_origen VARCHAR(45) DEFAULT '127.0.0.1',
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resultado VARCHAR(20) CHECK (resultado IN ('PERMITIDO', 'DENEGADO')),
          motivo TEXT NOT NULL
      );

      -- Departamentos
      INSERT INTO departamentos (id, nombre) VALUES 
      (1, 'SISTEMAS'), (2, 'FINANZAS'), (3, 'GERENCIA'), (4, 'AUDITORIA');

      -- 6 Roles Requeridos
      INSERT INTO roles (id, nombre) VALUES 
      (1, 'ADMINISTRADOR'), (2, 'GERENTE'), (3, 'SUPERVISOR'), 
      (4, 'EMPLEADO'), (5, 'AUDITOR'), (6, 'INVITADO');

      -- Permisos Matriz
      INSERT INTO permisos (id, codigo, descripcion) VALUES 
      (1, 'DOC_CREATE', 'Crear documento'),
      (2, 'DOC_READ', 'Consultar documento'),
      (3, 'DOC_UPDATE', 'Modificar documento'),
      (4, 'DOC_DELETE', 'Eliminar documento'),
      (5, 'DOC_APPROVE', 'Aprobar documento'),
      (6, 'AUDIT_READ', 'Ver auditoria'),
      (7, 'USER_MANAGE', 'Gestionar usuarios'),
      (8, 'ROLE_ASSIGN', 'Asignar roles');

      -- Matriz RBAC
      INSERT INTO rol_permisos (id_rol, id_permiso) VALUES 
      (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
      (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
      (3, 1), (3, 2), (3, 3), (3, 5),
      (4, 1), (4, 2), (4, 3),
      (5, 2), (5, 6),
      (6, 2);

      -- Usuario de prueba (Ejemplo Ana Torres)
      INSERT INTO usuarios (id, nombre, email, password_hash, id_rol, id_departamento, nivel_seguridad, pais, tipo_contrato, estado) VALUES 
      (25, 'Ana Torres', 'ana.torres@securedocs.com', '123', 3, 2, 3, 'PERU', 'INTERNO', 'ACTIVO');

      -- Documento de prueba (Ejemplo Presupuesto 2027)
      INSERT INTO documentos (id, titulo, descripcion, propietario_id, id_departamento, nivel_confidencialidad, estado, pais) VALUES 
      (501, 'Presupuesto 2027', 'Documento de presupuesto anual de Finanzas', 25, 2, 3, 'PENDIENTE', 'PERU');
    `);

    console.log('¡Base de datos cargada con todos los atributos de las imágenes 5.1 y 5.2!');
  } catch (error) {
    console.error('Error al inicializar PostgreSQL:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();