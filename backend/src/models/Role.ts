import { pool } from '../config/database';

export class RoleModel {
  public static async getAll(): Promise<any[]> {
    const query = `SELECT * FROM roles`;
    const result = await pool.query(query);
    return result.rows;
  }
}