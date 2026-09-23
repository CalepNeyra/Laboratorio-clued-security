# 🛡️ Sistema de Gestión Documental Seguro (RBAC + ABAC)

Este proyecto es una API RESTful desarrollada para la evaluación e implementación de modelos de control de acceso híbridos (**RBAC** y **ABAC**) sobre recursos documentales sensibles.

> **Estado del Proyecto:** 🟡 *MVP en Desarrollo / Prototipo Funcional*

---

## 🚀 Tecnologías Utilizadas

* **Lenguaje:** Node.js, TypeScript
* **Framework Web:** Express.js
* **Autenticación:** JWT (JSON Web Tokens) & Bcrypt
* **Base de Datos:** PostgreSQL / SQLite (driver de prueba)
* **Cliente API:** Thunder Client / Postman

---

## 🔐 Modelos de Control de Acceso Implementados

1. **RBAC (Role-Based Access Control):** 
   * Evalúa la jerarquía `Usuario -> Rol -> Permisos -> Operación`.
   * Bloquea solicitudes si el rol del usuario carece de la autorización para la ruta/método deseado.
2. **ABAC (Attribute-Based Access Control):** 
   * Contextualiza la decisión evaluando atributos en tiempo de ejecución:
     * **Sujeto:** Departamento, Nivel de Seguridad, Estado (`ACTIVO`), País.
     * **Objeto/Recurso:** Departamento destino, Nivel de Confidencialidad, País.
     * **Entorno:** Dirección IP, Timestamp de la solicitud.

---

## ✅ Funcionalidades Implementadas (Completadas)

- [x] **Módulo de Autenticación:**
  - Login con hashing y generación de firma JWT con payload de atributos.
  - Middleware de verificación de Token Bearer (`authenticateToken`).
- [x] **Motor de Políticas Híbrido:**
  - Middleware de validación RBAC por permisos explícitos (`checkRBAC`).
  - Middleware de evaluación situacional ABAC (`checkABAC`).
- [x] **Casos de Uso de Prueba (Matriz de Decisiones):**
  - **Caso Autorizado (200 OK):** Supervisor de Finanzas accediendo a documentos de su área.
  - **Caso Denegado por ABAC (403 Forbidden):** Empleado de RRHH bloqueado al intentar acceder a documentos de Finanzas.
- [x] **Módulo de Auditoría Básico:**
  - Trazabilidad de decisiones `PERMITIDO` / `DENEGADO` guardadas con contexto de IP y motivo.

---

## 🚧 Funcionalidades Pendientes / Próximos Pasos (Roadmap)

### 📌 Módulo de Usuarios
- [ ] Implementar endpoint de registro administrativo de usuarios (`POST /api/usuarios`).
- [ ] Endpoint para actualización de perfil, rol y departamento (`PUT /api/usuarios/:id`).
- [ ] Control de estado para activación/desactivación manual de cuentas (`PATCH /api/usuarios/:id/estado`).

### 📌 Módulo de Documentos (CRUD Completo)
- [ ] Endpoint para subida/creación de documentos (`POST /api/documentos`).
- [ ] Endpoint para modificación de confidencialidad (`PUT /api/documentos/:id`).
- [ ] Endpoint para borrado lógico/físico de archivos (`DELETE /api/documentos/:id`).
- [ ] Flujo de aprobación para cambio de estado de `PENDIENTE` a `PUBLICADO` (`PATCH /api/documentos/:id/aprobar`).

### 📌 Módulo de Autenticación y Seguridad Avanzada
- [ ] Endpoint explícito para invalidez de sesión / Logout (`POST /api/auth/logout`).
- [ ] Implementación de Blacklist/Revocación de JWTs o Tokens de Refresco (Refresh Tokens).
- [ ] Refactorización de persistencia a migración estricta PostgreSQL mediante ORM (Prisma / TypeORM).

### 📌 Frontend / Interfaz de Usuario
- [ ] Desarrollo de UI en React/HTML+Bootstrap para visualización de documentos según rol y estado.
- [ ] Panel interactivo de lectura de logs de Auditoría.

---

## 🛠️ Guía de Instalación y Ejecución Local

1. **Clonar repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITY>
   cd <NOMBRE_CARPETA>
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Inicializar esquema de base de datos de prueba:**
   ```bash
   npx tsx src/initDb.ts
   ```

4. **Levantar el servidor en modo desarrollo:**
   ```bash
   npx tsx src/app.ts
   ```