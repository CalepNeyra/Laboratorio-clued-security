import { pool } from '../config/database';
import { DocumentResource } from '../types';

export class DocumentModel {
  public static async findById(id: number): Promise<DocumentResource | null> {
    const query = `
      SELECT doc.id, doc.titulo, d.nombre AS departamento, doc.nivel_confidencialidad,
             doc.estado, doc.pais, doc.propietario_id
      FROM documentos doc
      JOIN departamentos d ON doc.id_departamento = d.id
      WHERE doc.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  public static async getAll(): Promise<DocumentResource[]> {
    const query = `
      SELECT doc.id, doc.titulo, d.nombre AS departamento, doc.nivel_confidencialidad,
             doc.estado, doc.pais, doc.propietario_id
      FROM documentos doc
      JOIN departamentos d ON doc.id_departamento = d.id
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}