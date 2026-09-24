import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { pool } from '../config/database';

// 1. Consultar Lista General (Filtrado por ABAC)
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

// 2. Consultar Documento por ID (Nuevo)
export const getDocumentoById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM documentos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    return res.status(200).json({
      message: 'Acceso AUTORIZADO',
      usuario: req.user?.nombre,
      documento: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener el documento:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// 3. Crear Documento
export const crearDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { titulo, id_departamento, nivel_confidencialidad, pais } = req.body;
  try {
    const query = `
      INSERT INTO documentos (titulo, id_departamento, nivel_confidencialidad, estado, pais, propietario_id)
      VALUES ($1, $2, $3, 'PENDIENTE', $4, $5)
      RETURNING id;
    `;
    const result = await pool.query(query, [
      titulo, 
      id_departamento, 
      nivel_confidencialidad, 
      pais, 
      req.user?.id
    ]);

    return res.status(201).json({ 
      message: 'Documento creado exitosamente', 
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error al crear documento:', error);
    return res.status(500).json({ message: 'Error al crear documento', error });
  }
};

// 4. Modificar Documento
export const modificarDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { titulo, nivel_confidencialidad } = req.body;
  try {
    const query = `
      UPDATE documentos 
      SET titulo = COALESCE($1, titulo), 
          nivel_confidencialidad = COALESCE($2, nivel_confidencialidad) 
      WHERE id = $3;
    `;
    await pool.query(query, [titulo, nivel_confidencialidad, id]);

    return res.json({ message: 'Documento actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    return res.status(500).json({ message: 'Error al actualizar documento', error });
  }
};

// 5. Eliminar Documento
export const eliminarDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM documentos WHERE id = $1', [id]);
    return res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    return res.status(500).json({ message: 'Error al eliminar documento', error });
  }
};

// 6. Aprobar Documento
export const aprobarDocumento = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE documentos SET estado = 'PUBLICADO' WHERE id = $1", [id]);
    return res.json({ message: 'Documento APROBADO y PUBLICADO con éxito' });
  } catch (error) {
    console.error('Error al aprobar documento:', error);
    return res.status(500).json({ message: 'Error al aprobar documento', error });
  }
};