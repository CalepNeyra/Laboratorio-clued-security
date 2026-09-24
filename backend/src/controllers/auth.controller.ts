import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario por correo uniendo la tabla departamentos
    const result = await pool.query(
      `SELECT u.*, r.nombre as rol, d.nombre as departamento 
       FROM usuarios u 
       JOIN roles r ON u.id_rol = r.id 
       LEFT JOIN departamentos d ON u.id_departamento = d.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    // 2. Validación de contraseña en TEXTO PLANO DIRECTO
    if (usuario.password_hash !== password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 3. Generar Token JWT con el campo 'departamento' para la auditoría y RBAC
    const secret = process.env.JWT_SECRET || 'supersecreto_jwt_key_12345';
    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        departamento: usuario.departamento || 'SISTEMAS', // Fallback si no tiene asignado uno
        id_departamento: usuario.id_departamento,
        nivel_seguridad: usuario.nivel_seguridad,
        pais: usuario.pais,
        tipo_contrato: usuario.tipo_contrato
      },
      secret,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};