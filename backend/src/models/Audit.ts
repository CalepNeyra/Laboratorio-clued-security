import { pool } from '../config/database';
import { AuditLog } from '../types';

export class AuditModel {
  public static async getAll(): Promise<AuditLog[]> {
    const query = `SELECT * FROM auditoria ORDER BY fecha DESC`;
    const result = await pool.query(query);
    return result.rows;
  }
}