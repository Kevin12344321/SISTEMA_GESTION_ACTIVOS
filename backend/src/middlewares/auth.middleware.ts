import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extendemos Request para guardar los datos
// del usuario que inició sesión
export interface AuthRequest extends Request {
  usuario?: {
    id_cuenta: number;
    id_usuario: number;
    rol: string;
  };
}

// =====================================================
// VERIFICAR TOKEN
// =====================================================

export const verificarToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener el encabezado Authorization
    const authorization = req.headers.authorization;

    // Verificar que exista
    if (!authorization) {
      return res.status(401).json({
        mensaje: "Token de acceso requerido"
      });
    }

    // El formato esperado es:
    // Bearer TOKEN
    const partes = authorization.split(" ");

    if (
      partes.length !== 2 ||
      partes[0] !== "Bearer"
    ) {
      return res.status(401).json({
        mensaje: "Formato de token inválido"
      });
    }

    const token = partes[1];

    // Obtener la clave secreta desde .env
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET no está configurado"
      );
    }

    // Verificar el token
    const decoded = jwt.verify(
      token,
      secret
    ) as {
      id_cuenta: number;
      id_usuario: number;
      rol: string;
    };

    // Guardamos los datos del usuario
    // dentro de la petición
    req.usuario = {
      id_cuenta: decoded.id_cuenta,
      id_usuario: decoded.id_usuario,
      rol: decoded.rol
    };

    // Continuar con la siguiente función
    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado"
    });
  }
};

// =====================================================
// SOLO ADMINISTRADOR
// =====================================================

export const soloAdministrador = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Primero verificamos que exista un usuario autenticado
  if (!req.usuario) {
    return res.status(401).json({
      mensaje: "Usuario no autenticado"
    });
  }

  // Verificar el rol
  if (req.usuario.rol !== "Administrador") {
    return res.status(403).json({
      mensaje:
        "No tienes permisos para realizar esta acción"
    });
  }

  // Es Administrador, puede continuar
  next();
};