import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { getDB } from '../config/database';

// 1. Consultar (Filtrado por ABAC)
export const getDocumentos = async (req: AuthenticatedRequest, res: Response) => {
  const documentos = (req as any).documentosPermitidos || [];
  return res.status(200).json({
    message: 'Acceso AUTORIZADO por ABAC',
    usuario: req.user?.nombre,
    departamento: req.user?.departamento,
    total_permitidos: documentos.length,
    documentos
  });
};

// 2. Crear Documento
export const crearDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { titulo, id_departamento, nivel_confidencialidad, pais } = req.body;
  try {
    const db = await getDB();
    const result = await db.run(
      `INSERT INTO documentos (titulo, id_departamento, nivel_confidencialidad, estado, pais, propietario_id)
       VALUES (?, ?, ?, 'PENDIENTE', ?, ?)`,
      [titulo, id_departamento, nivel_confidencialidad, pais, req.user?.id]
    );
    return res.status(201).json({ message: 'Documento creado exitosamente', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear documento', error });
  }
};

// 3. Modificar Documento
export const modificarDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { titulo, nivel_confidencialidad } = req.body;
  try {
    const db = await getDB();
    await db.run(
      `UPDATE documentos SET titulo = COALESCE(?, titulo), nivel_confidencialidad = COALESCE(?, nivel_confidencialidad) WHERE id = ?`,
      [titulo, nivel_confidencialidad, id]
    );
    return res.json({ message: 'Documento actualizado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar documento', error });
  }
};

// 4. Eliminar Documento
export const eliminarDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const db = await getDB();
    await db.run(`DELETE FROM documentos WHERE id = ?`, [id]);
    return res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar documento', error });
  }
};

// 5. Aprobar Documento
export const aprobarDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const db = await getDB();
    await db.run(`UPDATE documentos SET estado = 'PUBLICADO' WHERE id = ?`, [id]);
    return res.json({ message: 'Documento APROBADO y PUBLICADO con éxito' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al aprobar documento', error });
  }
};