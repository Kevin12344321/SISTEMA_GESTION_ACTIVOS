import { Request, Response } from "express";
import { pool } from "../config/database";

// =====================================================
// TIPOS DE ACTIVO
// =====================================================

export const obtenerTiposActivo = async (
  req: Request,
  res: Response
) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id_tipo_activo,
        nombre
      FROM tipos_activo
      ORDER BY nombre;
    `);

    res.json(resultado.rows);

  } catch (error) {
    console.error(
      "Error al consultar tipos de activo:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al consultar los tipos de activo"
    });
  }
};

export const crearTipoActivo = async (
  req: Request,
  res: Response
) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje: "El nombre es obligatorio"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO tipos_activo (
        nombre
      )
      VALUES ($1)
      RETURNING
        id_tipo_activo,
        nombre;
      `,
      [nombre.trim()]
    );

    res.status(201).json({
      mensaje:
        "Tipo de activo registrado correctamente",
      tipo_activo: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al registrar tipo de activo:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe un tipo de activo con ese nombre"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al registrar el tipo de activo"
    });
  }
};

export const actualizarTipoActivo = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje: "El nombre es obligatorio"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE tipos_activo
      SET nombre = $1
      WHERE id_tipo_activo = $2
      RETURNING
        id_tipo_activo,
        nombre;
      `,
      [
        nombre.trim(),
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje:
          "Tipo de activo no encontrado"
      });
    }

    res.json({
      mensaje:
        "Tipo de activo actualizado correctamente",
      tipo_activo: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al actualizar tipo de activo:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe un tipo de activo con ese nombre"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al actualizar el tipo de activo"
    });
  }
};

// =====================================================
// RAZONES SOCIALES
// =====================================================

export const obtenerRazonesSociales = async (
  req: Request,
  res: Response
) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id_razon_social,
        nombre
      FROM razones_sociales
      ORDER BY nombre;
    `);

    res.json(resultado.rows);

  } catch (error) {
    console.error(
      "Error al consultar razones sociales:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al consultar las razones sociales"
    });
  }
};

export const crearRazonSocial = async (
  req: Request,
  res: Response
) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje:
          "El nombre de la razón social es obligatorio"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO razones_sociales (
        nombre
      )
      VALUES ($1)
      RETURNING
        id_razon_social,
        nombre;
      `,
      [nombre.trim()]
    );

    res.status(201).json({
      mensaje:
        "Razón social registrada correctamente",
      razon_social: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al registrar razón social:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe una razón social con ese nombre"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al registrar la razón social"
    });
  }
};

export const actualizarRazonSocial = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje:
          "El nombre de la razón social es obligatorio"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE razones_sociales
      SET nombre = $1
      WHERE id_razon_social = $2
      RETURNING
        id_razon_social,
        nombre;
      `,
      [
        nombre.trim(),
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje:
          "Razón social no encontrada"
      });
    }

    res.json({
      mensaje:
        "Razón social actualizada correctamente",
      razon_social: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al actualizar razón social:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe una razón social con ese nombre"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al actualizar la razón social"
    });
  }
};

// =====================================================
// ÁREAS
// =====================================================

export const obtenerAreas = async (
  req: Request,
  res: Response
) => {
  try {
    const { id_razon_social } = req.query;

    let consulta = `
      SELECT
        ar.id_area,
        ar.nombre,
        ar.id_razon_social,
        rs.nombre AS razon_social
      FROM areas ar

      INNER JOIN razones_sociales rs
        ON ar.id_razon_social = rs.id_razon_social
    `;

    const valores: any[] = [];

    if (id_razon_social) {
      consulta += `
        WHERE ar.id_razon_social = $1
      `;

      valores.push(id_razon_social);
    }

    consulta += `
      ORDER BY ar.nombre;
    `;

    const resultado = await pool.query(
      consulta,
      valores
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error(
      "Error al consultar áreas:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al consultar las áreas"
    });
  }
};

export const crearArea = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      nombre,
      id_razon_social
    } = req.body;

    if (
      !nombre ||
      !nombre.trim() ||
      !id_razon_social
    ) {
      return res.status(400).json({
        mensaje:
          "Nombre y razón social son obligatorios"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO areas (
        nombre,
        id_razon_social
      )
      VALUES ($1, $2)
      RETURNING
        id_area,
        nombre,
        id_razon_social;
      `,
      [
        nombre.trim(),
        id_razon_social
      ]
    );

    res.status(201).json({
      mensaje:
        "Área registrada correctamente",
      area: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al registrar área:",
      error
    );

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "La razón social seleccionada no existe"
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe esa área"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al registrar el área"
    });
  }
};

export const actualizarArea = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      id_razon_social
    } = req.body;

    if (
      !nombre ||
      !nombre.trim() ||
      !id_razon_social
    ) {
      return res.status(400).json({
        mensaje:
          "Nombre y razón social son obligatorios"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE areas
      SET
        nombre = $1,
        id_razon_social = $2
      WHERE id_area = $3
      RETURNING
        id_area,
        nombre,
        id_razon_social;
      `,
      [
        nombre.trim(),
        id_razon_social,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje:
          "Área no encontrada"
      });
    }

    res.json({
      mensaje:
        "Área actualizada correctamente",
      area: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al actualizar área:",
      error
    );

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "La razón social seleccionada no existe"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al actualizar el área"
    });
  }
};

// =====================================================
// NAVES
// =====================================================

export const obtenerNaves = async (
  req: Request,
  res: Response
) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id_nave,
        nombre
      FROM naves
      ORDER BY nombre;
    `);

    res.json(resultado.rows);

  } catch (error) {
    console.error(
      "Error al consultar naves:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al consultar las naves"
    });
  }
};

export const crearNave = async (
  req: Request,
  res: Response
) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje:
          "El nombre de la nave es obligatorio"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO naves (
        nombre
      )
      VALUES ($1)
      RETURNING
        id_nave,
        nombre;
      `,
      [nombre.trim()]
    );

    res.status(201).json({
      mensaje:
        "Nave registrada correctamente",
      nave: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al registrar nave:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe una nave con ese nombre"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al registrar la nave"
    });
  }
};

export const actualizarNave = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje:
          "El nombre de la nave es obligatorio"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE naves
      SET nombre = $1
      WHERE id_nave = $2
      RETURNING
        id_nave,
        nombre;
      `,
      [
        nombre.trim(),
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje:
          "Nave no encontrada"
      });
    }

    res.json({
      mensaje:
        "Nave actualizada correctamente",
      nave: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al actualizar nave:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al actualizar la nave"
    });
  }
};

// =====================================================
// UBICACIONES
// =====================================================

export const obtenerUbicaciones = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      id_nave,
      id_razon_social
    } = req.query;

    let consulta = `
      SELECT
        ub.id_ubicacion,
        ub.nombre,
        ub.id_nave,
        n.nombre AS nave,
        ub.id_razon_social,
        rs.nombre AS razon_social

      FROM ubicaciones ub

      LEFT JOIN naves n
        ON ub.id_nave = n.id_nave

      LEFT JOIN razones_sociales rs
        ON ub.id_razon_social = rs.id_razon_social

      WHERE 1 = 1
    `;

    const valores: any[] = [];
    let contador = 1;

    if (id_nave) {
      consulta += `
        AND ub.id_nave = $${contador}
      `;

      valores.push(id_nave);
      contador++;
    }

    if (id_razon_social) {
      consulta += `
        AND ub.id_razon_social = $${contador}
      `;

      valores.push(id_razon_social);
    }

    consulta += `
      ORDER BY ub.nombre;
    `;

    const resultado = await pool.query(
      consulta,
      valores
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error(
      "Error al consultar ubicaciones:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al consultar las ubicaciones"
    });
  }
};

export const crearUbicacion = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      nombre,
      id_nave,
      id_razon_social
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje:
          "El nombre de la ubicación es obligatorio"
      });
    }

    if (
      !id_nave &&
      !id_razon_social
    ) {
      return res.status(400).json({
        mensaje:
          "La ubicación debe relacionarse con una nave o razón social"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO ubicaciones (
        nombre,
        id_nave,
        id_razon_social
      )
      VALUES ($1, $2, $3)
      RETURNING
        id_ubicacion,
        nombre,
        id_nave,
        id_razon_social;
      `,
      [
        nombre.trim(),
        id_nave || null,
        id_razon_social || null
      ]
    );

    res.status(201).json({
      mensaje:
        "Ubicación registrada correctamente",
      ubicacion: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al registrar ubicación:",
      error
    );

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "La nave o razón social seleccionada no existe"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al registrar la ubicación"
    });
  }
};

export const actualizarUbicacion = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      id_nave,
      id_razon_social
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje:
          "El nombre de la ubicación es obligatorio"
      });
    }

    if (
      !id_nave &&
      !id_razon_social
    ) {
      return res.status(400).json({
        mensaje:
          "La ubicación debe relacionarse con una nave o razón social"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE ubicaciones
      SET
        nombre = $1,
        id_nave = $2,
        id_razon_social = $3
      WHERE id_ubicacion = $4
      RETURNING
        id_ubicacion,
        nombre,
        id_nave,
        id_razon_social;
      `,
      [
        nombre.trim(),
        id_nave || null,
        id_razon_social || null,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje:
          "Ubicación no encontrada"
      });
    }

    res.json({
      mensaje:
        "Ubicación actualizada correctamente",
      ubicacion: resultado.rows[0]
    });

  } catch (error: any) {
    console.error(
      "Error al actualizar ubicación:",
      error
    );

    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "La nave o razón social seleccionada no existe"
      });
    }

    res.status(500).json({
      mensaje:
        "Error al actualizar la ubicación"
    });
  }
};