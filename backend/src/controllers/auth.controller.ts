import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      nombre_usuario,
      password
    } = req.body;

    if (!nombre_usuario || !password) {
      return res.status(400).json({
        mensaje: "Usuario y contraseña son obligatorios"
      });
    }

    const resultado = await pool.query(
      `
      SELECT
        c.id_cuenta,
        c.id_usuario,
        c.nombre_usuario,
        c.password_hash,
        c.rol,
        c.estado,
        u.nombre,
        u.apellidos

      FROM cuentas c

      INNER JOIN usuarios u
        ON c.id_usuario = u.id_usuario

      WHERE c.nombre_usuario = $1;
      `,
      [nombre_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensaje: "Usuario o contraseña incorrectos"
      });
    }

    const cuenta = resultado.rows[0];

    if (cuenta.estado !== "Activo") {
      return res.status(403).json({
        mensaje: "La cuenta se encuentra inactiva"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      cuenta.password_hash
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Usuario o contraseña incorrectos"
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET no está configurado"
      );
    }

    const token = jwt.sign(
      {
        id_cuenta: cuenta.id_cuenta,
        id_usuario: cuenta.id_usuario,
        rol: cuenta.rol
      },
      secret,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "8h"
      } as jwt.SignOptions
    );

    res.json({
      mensaje: "Inicio de sesión correcto",

      token,

      usuario: {
        id_usuario: cuenta.id_usuario,
        nombre: cuenta.nombre,
        apellidos: cuenta.apellidos,
        nombre_usuario: cuenta.nombre_usuario,
        rol: cuenta.rol
      }
    });

  } catch (error) {
    console.error(
      "Error al iniciar sesión:",
      error
    );

    res.status(500).json({
      mensaje: "Error al iniciar sesión"
    });
  }
};