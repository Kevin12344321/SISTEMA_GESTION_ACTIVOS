import { Request, Response } from "express";
import { pool } from "../config/database";
import bcrypt from "bcryptjs";

export const obtenerUsuarios = async (
  req: Request,
  res: Response
) => {
  try {
   const resultado = await pool.query(`
  SELECT
    u.id_usuario,
    u.numero_nomina,
    u.nombre,
    u.apellidos,
    u.puesto,
    u.estado,

    rs.nombre AS razon_social,
    ar.nombre AS area,
    n.nombre AS nave,
    ub.nombre AS ubicacion,

    c.id_cuenta,
    c.nombre_usuario,
    c.rol,
    c.estado AS estado_cuenta

  FROM usuarios u

  INNER JOIN razones_sociales rs
    ON u.id_razon_social = rs.id_razon_social

  INNER JOIN areas ar
    ON u.id_area = ar.id_area

  LEFT JOIN naves n
    ON u.id_nave = n.id_nave

  LEFT JOIN ubicaciones ub
    ON u.id_ubicacion = ub.id_ubicacion

  LEFT JOIN cuentas c
    ON u.id_usuario = c.id_usuario

  ORDER BY u.nombre, u.apellidos;
`);

    res.json(resultado.rows);

  } catch (error) {
    console.error("Error al consultar usuarios:", error);

    res.status(500).json({
      mensaje: "Error al consultar los usuarios"
    });
  }
};

export const buscarUsuarioPorNomina = async (
  req: Request,
  res: Response
) => {
  try {
    const { nomina } = req.params;

    const resultado = await pool.query(
      `
      SELECT
        u.id_usuario,
        u.numero_nomina,
        u.nombre,
        u.apellidos,
        u.puesto,
        u.estado,
        u.id_razon_social,
        rs.nombre AS razon_social,
        u.id_area,
        ar.nombre AS area,
        u.id_nave,
        n.nombre AS nave,
        u.id_ubicacion,
        ub.nombre AS ubicacion
      FROM usuarios u
      INNER JOIN razones_sociales rs
        ON u.id_razon_social = rs.id_razon_social
      INNER JOIN areas ar
        ON u.id_area = ar.id_area
      LEFT JOIN naves n
        ON u.id_nave = n.id_nave
      LEFT JOIN ubicaciones ub
        ON u.id_ubicacion = ub.id_ubicacion
      WHERE u.numero_nomina = $1;
      `,
      [nomina]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error("Error al buscar usuario:", error);

    res.status(500).json({
      mensaje: "Error al buscar el usuario"
    });
  }
};

export const crearUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      numero_nomina,
      nombre,
      apellidos,
      puesto,
      id_razon_social,
      id_area,
      id_nave,
      id_ubicacion
    } = req.body;

    if (
      !numero_nomina ||
      !nombre ||
      !apellidos ||
      !puesto ||
      !id_razon_social ||
      !id_area
    ) {
      return res.status(400).json({
        mensaje:
          "Nómina, nombre, apellidos, puesto, razón social y área son obligatorios"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO usuarios (
        numero_nomina,
        nombre,
        apellidos,
        puesto,
        id_razon_social,
        id_area,
        id_nave,
        id_ubicacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id_usuario,
        numero_nomina,
        nombre,
        apellidos,
        puesto,
        id_razon_social,
        id_area,
        id_nave,
        id_ubicacion,
        estado;
      `,
      [
        numero_nomina,
        nombre,
        apellidos,
        puesto,
        id_razon_social,
        id_area,
        id_nave || null,
        id_ubicacion || null
      ]
    );

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: resultado.rows[0]
    });

  } catch (error: any) {
    console.error("Error al registrar usuario:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje: "Ya existe un usuario con ese número de nómina"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "La razón social, área, nave o ubicación seleccionada no existe"
      });
    }

    res.status(500).json({
      mensaje: "Error al registrar el usuario"
    });
  }
};

export const actualizarUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      numero_nomina,
      nombre,
      apellidos,
      puesto,
      id_razon_social,
      id_area,
      id_nave,
      id_ubicacion
    } = req.body;

    if (
      !numero_nomina ||
      !nombre ||
      !apellidos ||
      !puesto ||
      !id_razon_social ||
      !id_area
    ) {
      return res.status(400).json({
        mensaje:
          "Nómina, nombre, apellidos, puesto, razón social y área son obligatorios"
      });
    }

    const usuarioExiste = await pool.query(
      `
      SELECT id_usuario
      FROM usuarios
      WHERE id_usuario = $1;
      `,
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE usuarios
      SET
        numero_nomina = $1,
        nombre = $2,
        apellidos = $3,
        puesto = $4,
        id_razon_social = $5,
        id_area = $6,
        id_nave = $7,
        id_ubicacion = $8
      WHERE id_usuario = $9
      RETURNING
        id_usuario,
        numero_nomina,
        nombre,
        apellidos,
        puesto,
        id_razon_social,
        id_area,
        id_nave,
        id_ubicacion,
        estado;
      `,
      [
        numero_nomina.trim(),
        nombre.trim(),
        apellidos.trim(),
        puesto.trim(),
        id_razon_social,
        id_area,
        id_nave || null,
        id_ubicacion || null,
        id
      ]
    );

    res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al actualizar usuario:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe otro usuario con ese número de nómina"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "La razón social, área, nave o ubicación seleccionada no existe"
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar el usuario"
    });
  }
};


export const cambiarEstadoUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (
      estado !== "Activo" &&
      estado !== "Inactivo"
    ) {
      return res.status(400).json({
        mensaje:
          "El estado debe ser Activo o Inactivo"
      });
    }

    const usuarioActual = await pool.query(
      `
      SELECT
        id_usuario,
        numero_nomina,
        nombre,
        apellidos,
        estado
      FROM usuarios
      WHERE id_usuario = $1;
      `,
      [id]
    );

    if (usuarioActual.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    if (usuarioActual.rows[0].estado === estado) {
      return res.status(400).json({
        mensaje:
          `El usuario ya se encuentra ${estado.toLowerCase()}`
      });
    }

    const resultado = await pool.query(
      `
      UPDATE usuarios
      SET estado = $1
      WHERE id_usuario = $2
      RETURNING
        id_usuario,
        numero_nomina,
        nombre,
        apellidos,
        estado;
      `,
      [
        estado,
        id
      ]
    );

    res.json({
      mensaje:
        estado === "Activo"
          ? "Usuario activado correctamente"
          : "Usuario desactivado correctamente",

      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error(
      "Error al cambiar estado del usuario:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al cambiar el estado del usuario"
    });
  }
};

export const crearCuentaUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      nombre_usuario,
      password,
      rol
    } = req.body;

    if (
      !nombre_usuario ||
      !password ||
      !rol
    ) {
      return res.status(400).json({
        mensaje:
          "Nombre de usuario, contraseña y rol son obligatorios"
      });
    }

    if (
      rol !== "Administrador" &&
      rol !== "Consulta"
    ) {
      return res.status(400).json({
        mensaje:
          "El rol debe ser Administrador o Consulta"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        mensaje:
          "La contraseña debe tener al menos 6 caracteres"
      });
    }

    const usuarioResultado =
      await pool.query(
        `
        SELECT
          id_usuario,
          nombre,
          apellidos,
          estado
        FROM usuarios
        WHERE id_usuario = $1;
        `,
        [id]
      );

    if (usuarioResultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const usuario =
      usuarioResultado.rows[0];

    if (usuario.estado !== "Activo") {
      return res.status(400).json({
        mensaje:
          "No se puede crear una cuenta para un usuario inactivo"
      });
    }

    const cuentaExistente =
      await pool.query(
        `
        SELECT id_cuenta
        FROM cuentas
        WHERE id_usuario = $1;
        `,
        [id]
      );

    if (cuentaExistente.rows.length > 0) {
      return res.status(409).json({
        mensaje:
          "Este usuario ya tiene una cuenta de acceso"
      });
    }

    const nombreExistente =
      await pool.query(
        `
        SELECT id_cuenta
        FROM cuentas
        WHERE nombre_usuario = $1;
        `,
        [nombre_usuario.trim()]
      );

    if (nombreExistente.rows.length > 0) {
      return res.status(409).json({
        mensaje:
          "Ese nombre de usuario ya se encuentra registrado"
      });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    const resultado =
      await pool.query(
        `
        INSERT INTO cuentas (
          id_usuario,
          nombre_usuario,
          password_hash,
          rol,
          estado
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          'Activo'
        )
        RETURNING
          id_cuenta,
          id_usuario,
          nombre_usuario,
          rol,
          estado;
        `,
        [
          id,
          nombre_usuario.trim(),
          passwordHash,
          rol
        ]
      );

    res.status(201).json({
      mensaje:
        "Cuenta creada correctamente",

      cuenta: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al crear cuenta:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "El usuario ya tiene cuenta o el nombre de usuario ya existe"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "El usuario seleccionado no existe"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al crear la cuenta"
    });
  }
};