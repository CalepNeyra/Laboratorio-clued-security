# 🛡️ SecureDocs DMS - Sistema de Gestión Documental Seguro (RBAC + ABAC)

Plataforma de Gestión Documental y Dashboard de Seguridad de nivel producción para la evaluación e implementación de modelos de control de acceso híbridos (**RBAC** y **ABAC**) sobre recursos documentales sensibles, con trazabilidad dinámica mediante auditoría.

---

## 📋 Tabla de Contenidos
1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Entregables Cumplidos](#2-entregables-cumplidos)
3. [Instrucciones de Instalación y Ejecución](#3-instrucciones-de-instalación-y-ejecución)
4. [Modelo de Base de Datos y Esquema](#4-modelo-de-base-de-datos-y-esquema)
5. [Matriz de Roles y Permisos RBAC](#5-matriz-de-roles-y-permisos-rbac)
6. [Matriz de Políticas ABAC](#6-matriz-de-políticas-abac)
7. [Casos de Prueba y Credenciales](#7-casos-de-prueba-y-credenciales)
8. [Evidencias de Ejecución (Capturas del Sistema)](#8-evidencias-de-ejecución-capturas-del-sistema)
9. [Estructura del Registro de Auditoría](#9-estructura-del-registro-de-auditoría)
10. [Guía para Demostración en Video](#10-guía-para-demostración-en-video)

---

## 1. Descripción del Proyecto

El sistema implementa una arquitectura desacoplada basada en un monorepo con **Node.js, Express y TypeScript** en el backend y **React con Vite** en el frontend.

El motor de políticas centralizado (`evaluarPoliticaSeguridad`) valida tanto los roles del usuario como los atributos en tiempo de ejecución (clearance, departamento, horario y dispositivo) antes de otorgar acceso a los recursos.

---

## 2. Entregables Cumplidos
- [x] **1. Código Fuente:** Proyecto monorepo estructurado en `backend/` y `frontend/`.
- [x] **2. Repositorio Git:** Control de versiones con historial de commits estructurado.
- [x] **3. README:** Guía completa con requisitos, configuración y despliegue.
- [x] **4. Arquitectura:** Monorepo con API RESTful desacoplada de la UI.
- [x] **5. Modelo de BD:** Esquema relacional optimizado (`usuarios`, `roles`, `documentos`, etc.).
- [x] **6. Matriz RBAC:** Asignación explícita de verbos por rol.
- [x] **7. Matriz ABAC:** Reglas basadas en atributos de contexto y entorno.
- [x] **8. Evidencias de Pruebas:** Cobertura de casos requeridos y adicionales.
- [x] **9. Registro de Auditoría:** Endpoint dinámico `GET /api/auditoria` con formato JSON.
- [x] **10. Demostración:** Guía paso a paso para simulación o grabado en video.

---

## 3. Instrucciones de Instalación y Ejecución

### Prerrequisitos
* **Node.js**: v18.x o v20.x+
* **npm**: v9.x+

### Step-by-Step para Levantar el Proyecto

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/CalepNeyra/Laboratorio-clued-security.git
   cd Laboratorio-clued-security

   ---

### 3. Comandos de Git para Subir los Cambios

Asegúrate de agregar los `.env` al `.gitignore` para no subir secretos, pero **SÍ subir los `.env.example`** y el `README.md` actualizado:

```bash
# Registrar cambios y subir a GitHub
git add backend/.env.example frontend/.env.example README.md
git add .
git commit -m "docs: agrega archivos .env.example e instrucciones completas para evaluador"
git push origin main
