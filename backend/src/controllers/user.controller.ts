import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { getDB } from '../config/database';

// 1. Registrar usuario
export const registrarUsuario = async (req: AuthenticatedRequest, res: Response) => {
  const { nombre, email, password, id_rol, id_departamento, nivel_seguridad, pais, tipo_contrato } = req.body;
  try {
    const db = await getDB();
    const result = await db.run(
      `INSERT INTO usuarios (nombre, email, password_hash, id_rol, id_departamento, nivel_seguridad, pais, tipo_contrato, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
      [nombre, email, password, id_rol, id_departamento, nivel_seguridad, pais, tipo_contrato || 'INTERNO']
    );
    return res.status(201).json({ message: 'Usuario registrado con éxito', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar usuario', error });
  }
};

// 2. Modificar usuario (Asignar rol, dpto, nivel)
export const modificarUsuario = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, id_rol, id_departamento, nivel_seguridad, pais } = req.body;
  try {
    const db = await getDB();
    await db.run(
      `UPDATE usuarios 
       SET nombre = COALESCE(?, nombre),
           id_rol = COALESCE(?, id_rol),
           id_departamento = COALESCE(?, id_departamento),
           nivel_seguridad = COALESCE(?, nivel_seguridad),
           pais = COALESCE(?, pais)
       WHERE id = ?`,
      [nombre, id_rol, id_departamento, nivel_seguridad, pais, id]
    );
    return res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar usuario', error });
  }
};

// 3. Activar/Desactivar usuario
export const cambiarEstadoUsuario = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { estado } = req.body; // 'ACTIVO' o 'INACTIVO'
  try {
    const db = await getDB();
    await db.run(`UPDATE usuarios SET estado = ? WHERE id = ?`, [estado, id]);
    return res.json({ message: `Estado del usuario actualizado a ${estado}` });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar estado', error });
  }
};