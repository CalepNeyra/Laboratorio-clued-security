import { pool } from '../config/database';
import { UserSubject } from '../types';

export class UserModel {
  public static async findByEmail(email: string): Promise<(UserSubject & { password_hash: string }) | null> {
    const query = `
      SELECT u.id, u.nombre, u.email, u.password_hash, r.nombre AS rol, d.nombre AS departamento, 
             u.nivel_seguridad, u.pais, u.tipo_contrato, u.estado
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id
      JOIN departamentos d ON u.id_departamento = d.id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  public static async findById(id: number): Promise<UserSubject | null> {
    const query = `
      SELECT u.id, u.nombre, u.email, r.nombre AS rol, d.nombre AS departamento, 
             u.nivel_seguridad, u.pais, u.tipo_contrato, u.estado
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id
      JOIN departamentos d ON u.id_departamento = d.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}