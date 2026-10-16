import { Request, Response } from "express";
import { pool } from "../config/database";

/*
|--------------------------------------------------------------------------
| OBTENER TODOS LOS ACTIVOS
|--------------------------------------------------------------------------
*/
export const obtenerActivos = async (
  req: Request,
  res: Response
) => {
  try {
    const resultado = await pool.query(`
      SELECT
        a.id_activo,
        a.codigo_activo,
        ta.nombre AS tipo_activo,
        a.marca,
        a.modelo,
        a.numero_serie,
        a.estado,

        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_responsable,
        rs.nombre AS razon_social,
        ar.nombre AS area,
        n.nombre AS nave,
        ub.nombre AS ubicacion,

        a.fecha_asignacion,
        a.fecha_baja,
        a.motivo_baja

      FROM activos a

      INNER JOIN tipos_activo ta
        ON a.id_tipo_activo = ta.id_tipo_activo

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      ORDER BY a.id_activo;
    `);

    res.json(resultado.rows);

  } catch (error) {
    console.error("Error al consultar activos:", error);

    res.status(500).json({
      mensaje: "Error al consultar los activos"
    });
  }
};


/*
|--------------------------------------------------------------------------
| BUSCAR ACTIVOS
|--------------------------------------------------------------------------
*/
export const buscarActivos = async (
  req: Request,
  res: Response
) => {
  try {
    const busqueda = req.query.q;

    // Verificamos que el usuario haya escrito algo
    if (!busqueda || typeof busqueda !== "string") {
      return res.status(400).json({
        mensaje: "Debes proporcionar un término de búsqueda"
      });
    }

    // Los % permiten buscar coincidencias parciales
    const termino = `%${busqueda}%`;

    const resultado = await pool.query(
      `
      SELECT
        a.id_activo,
        a.codigo_activo,
        ta.nombre AS tipo_activo,
        a.marca,
        a.modelo,
        a.numero_serie,
        a.estado,

        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_responsable,
        rs.nombre AS razon_social,
        ar.nombre AS area,
        n.nombre AS nave,
        ub.nombre AS ubicacion,

        a.fecha_asignacion,
        a.fecha_baja,
        a.motivo_baja

      FROM activos a

      INNER JOIN tipos_activo ta
        ON a.id_tipo_activo = ta.id_tipo_activo

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE
        a.codigo_activo ILIKE $1
        OR a.numero_serie ILIKE $1
        OR a.marca ILIKE $1
        OR a.modelo ILIKE $1
        OR ta.nombre ILIKE $1
        OR CONCAT(u.nombre, ' ', u.apellidos) ILIKE $1
        OR rs.nombre ILIKE $1
        OR ar.nombre ILIKE $1
        OR n.nombre ILIKE $1
        OR ub.nombre ILIKE $1

      ORDER BY a.id_activo;
      `,
      [termino]
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error("Error al buscar activos:", error);

    res.status(500).json({
      mensaje: "Error al buscar los activos"
    });
  }
};


export const crearActivo = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      id_tipo_activo,
      marca,
      modelo,
      numero_serie,
      numero_serie_mouse,
      numero_serie_teclado,
      numero_serie_diadema,
      numero_serie_cargador,
      licenciamientos
    } = req.body;

    // El tipo de activo sigue siendo obligatorio
    if (!id_tipo_activo) {
      return res.status(400).json({
        mensaje: "El tipo de activo es obligatorio"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO activos (
        codigo_activo,
        id_tipo_activo,
        marca,
        modelo,
        numero_serie,
        numero_serie_mouse,
        numero_serie_teclado,
        numero_serie_diadema,
        numero_serie_cargador,
        licenciamientos
      )
      VALUES (
        'TEMP',
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING
        id_activo,
        codigo_activo,
        id_tipo_activo,
        marca,
        modelo,
        numero_serie,
        numero_serie_mouse,
        numero_serie_teclado,
        numero_serie_diadema,
        numero_serie_cargador,
        licenciamientos,
        estado;
      `,
      [
        id_tipo_activo,
        marca?.trim() || null,
        modelo?.trim() || null,
        numero_serie?.trim() || null,
        numero_serie_mouse?.trim() || null,
        numero_serie_teclado?.trim() || null,
        numero_serie_diadema?.trim() || null,
        numero_serie_cargador?.trim() || null,
        licenciamientos?.trim() || null
      ]
    );

    res.status(201).json({
      mensaje: "Activo registrado correctamente",
      activo: resultado.rows[0]
    });

  } catch (error: any) {
    console.error("Error al registrar activo:", error);

    // Número de serie o código repetido
    if (error.code === "23505") {
      return res.status(409).json({
        mensaje:
          "Ya existe un activo con ese número de serie o código"
      });
    }

    // Tipo de activo inexistente
    if (error.code === "23503") {
      return res.status(400).json({
        mensaje:
          "El tipo de activo seleccionado no existe"
      });
    }

    res.status(500).json({
      mensaje: "Error al registrar el activo"
    });
  }
};

export const obtenerActivoPorId = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      SELECT
        a.id_activo,
        a.codigo_activo,
        ta.nombre AS tipo_activo,
      a.marca,
a.modelo,
a.numero_serie,

a.numero_serie_mouse,
a.numero_serie_teclado,
a.numero_serie_diadema,
a.numero_serie_cargador,
a.licenciamientos,

a.estado,

        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_responsable,
        rs.nombre AS razon_social,
        ar.nombre AS area,
        n.nombre AS nave,
        ub.nombre AS ubicacion,

        a.fecha_asignacion,
        a.fecha_baja,
        a.motivo_baja

      FROM activos a

      INNER JOIN tipos_activo ta
        ON a.id_tipo_activo = ta.id_tipo_activo

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE a.id_activo = $1;
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error("Error al consultar el activo:", error);

    res.status(500).json({
      mensaje: "Error al consultar el activo"
    });
  }
};

export const asignarActivo = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      id_usuario,
      id_razon_social,
      id_area,
      id_nave,
      id_ubicacion
    } = req.body;

    if (!id_usuario || !id_razon_social || !id_area) {
      return res.status(400).json({
        mensaje: "Usuario, razón social y área son obligatorios"
      });
    }

    await client.query("BEGIN");

    const activoActual = await client.query(
      `
      SELECT
        a.*,
        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_actual,
        rs.nombre AS razon_social_actual,
        ar.nombre AS area_actual,
        n.nombre AS nave_actual,
        ub.nombre AS ubicacion_actual
      FROM activos a
      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario
      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social
      LEFT JOIN areas ar
        ON a.id_area = ar.id_area
      LEFT JOIN naves n
        ON a.id_nave = n.id_nave
      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion
      WHERE a.id_activo = $1
      FOR UPDATE OF a;
      `,
      [id]
    );

    if (activoActual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    const activo = activoActual.rows[0];

    if (activo.estado === "Baja") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "No se puede asignar un activo dado de baja"
      });
    }

    const usuarioResultado = await client.query(
      `
      SELECT
        id_usuario,
        CONCAT(nombre, ' ', apellidos) AS nombre_completo,
        estado
      FROM usuarios
      WHERE id_usuario = $1;
      `,
      [id_usuario]
    );

    if (usuarioResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const usuario = usuarioResultado.rows[0];

    if (usuario.estado === "Inactivo") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "No se puede asignar un activo a un usuario inactivo"
      });
    }

    const razonResultado = await client.query(
      `
      SELECT nombre
      FROM razones_sociales
      WHERE id_razon_social = $1;
      `,
      [id_razon_social]
    );

    if (razonResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Razón social no encontrada"
      });
    }

    const areaResultado = await client.query(
      `
      SELECT nombre
      FROM areas
      WHERE id_area = $1;
      `,
      [id_area]
    );

    if (areaResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Área no encontrada"
      });
    }

    let nombreNave = null;

    if (id_nave) {
      const naveResultado = await client.query(
        `
        SELECT nombre
        FROM naves
        WHERE id_nave = $1;
        `,
        [id_nave]
      );

      if (naveResultado.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          mensaje: "Nave no encontrada"
        });
      }

      nombreNave = naveResultado.rows[0].nombre;
    }

    let nombreUbicacion = null;

    if (id_ubicacion) {
      const ubicacionResultado = await client.query(
        `
        SELECT nombre
        FROM ubicaciones
        WHERE id_ubicacion = $1;
        `,
        [id_ubicacion]
      );

      if (ubicacionResultado.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          mensaje: "Ubicación no encontrada"
        });
      }

      nombreUbicacion = ubicacionResultado.rows[0].nombre;
    }

    await client.query(
      `
      UPDATE activos
      SET
        id_usuario = $1,
        id_razon_social = $2,
        id_area = $3,
        id_nave = $4,
        id_ubicacion = $5,
        estado = 'En uso',
        fecha_asignacion = CURRENT_TIMESTAMP,
        fecha_baja = NULL,
        motivo_baja = NULL
      WHERE id_activo = $6;
      `,
      [
        id_usuario,
        id_razon_social,
        id_area,
        id_nave || null,
        id_ubicacion || null,
        id
      ]
    );

    await client.query(
      `
      INSERT INTO movimientos (
        id_activo,
        tipo_movimiento,

        id_usuario_anterior,
        usuario_anterior,
        id_razon_social_anterior,
        razon_social_anterior,
        id_area_anterior,
        area_anterior,
        id_nave_anterior,
        nave_anterior,
        id_ubicacion_anterior,
        ubicacion_anterior,
        estado_anterior,

        id_usuario_nuevo,
        usuario_nuevo,
        id_razon_social_nueva,
        razon_social_nueva,
        id_area_nueva,
        area_nueva,
        id_nave_nueva,
        nave_nueva,
        id_ubicacion_nueva,
        ubicacion_nueva,
        estado_nuevo
      )
      VALUES (
        $1,
        'Asignación',

        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,

        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,
        $22,
        'En uso'
      );
      `,
      [
        id,

        activo.id_usuario,
        activo.usuario_actual,
        activo.id_razon_social,
        activo.razon_social_actual,
        activo.id_area,
        activo.area_actual,
        activo.id_nave,
        activo.nave_actual,
        activo.id_ubicacion,
        activo.ubicacion_actual,
        activo.estado,

        id_usuario,
        usuario.nombre_completo,
        id_razon_social,
        razonResultado.rows[0].nombre,
        id_area,
        areaResultado.rows[0].nombre,
        id_nave || null,
        nombreNave,
        id_ubicacion || null,
        nombreUbicacion
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Activo asignado correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error al asignar activo:", error);

    res.status(500).json({
      mensaje: "Error al asignar el activo"
    });

  } finally {
    client.release();
  }
};

export const devolverActivo = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const activoActual = await client.query(
      `
      SELECT
        a.*,
        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_actual,
        rs.nombre AS razon_social_actual,
        ar.nombre AS area_actual,
        n.nombre AS nave_actual,
        ub.nombre AS ubicacion_actual
      FROM activos a

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE a.id_activo = $1
      FOR UPDATE OF a;
      `,
      [id]
    );

    if (activoActual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    const activo = activoActual.rows[0];

    if (activo.estado === "Baja") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "Un activo dado de baja no puede devolverse al almacén"
      });
    }

    if (activo.estado === "En almacén") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo ya se encuentra en almacén"
      });
    }

    await client.query(
      `
      UPDATE activos
      SET
        estado = 'En almacén',
        id_usuario = NULL,
        id_razon_social = NULL,
        id_area = NULL,
        id_nave = NULL,
        id_ubicacion = NULL,
        fecha_asignacion = NULL
      WHERE id_activo = $1;
      `,
      [id]
    );

    await client.query(
      `
      INSERT INTO movimientos (
        id_activo,
        tipo_movimiento,

        id_usuario_anterior,
        usuario_anterior,
        id_razon_social_anterior,
        razon_social_anterior,
        id_area_anterior,
        area_anterior,
        id_nave_anterior,
        nave_anterior,
        id_ubicacion_anterior,
        ubicacion_anterior,
        estado_anterior,

        id_usuario_nuevo,
        usuario_nuevo,
        id_razon_social_nueva,
        razon_social_nueva,
        id_area_nueva,
        area_nueva,
        id_nave_nueva,
        nave_nueva,
        id_ubicacion_nueva,
        ubicacion_nueva,
        estado_nuevo
      )
      VALUES (
        $1,
        'Devolución',

        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,

        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'En almacén'
      );
      `,
      [
        id,

        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        activo.id_area,
        activo.area_actual,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Activo devuelto al almacén correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error al devolver activo:", error);

    res.status(500).json({
      mensaje: "Error al devolver el activo"
    });

  } finally {
    client.release();
  }
};

export const cambiarUsuarioActivo = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      id_usuario,
      id_razon_social,
      id_area,
      id_nave,
      id_ubicacion
    } = req.body;

    if (!id_usuario || !id_razon_social || !id_area) {
      return res.status(400).json({
        mensaje: "Usuario, razón social y área son obligatorios"
      });
    }

    await client.query("BEGIN");

    const activoActual = await client.query(
      `
      SELECT
        a.*,
        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_actual,
        rs.nombre AS razon_social_actual,
        ar.nombre AS area_actual,
        n.nombre AS nave_actual,
        ub.nombre AS ubicacion_actual
      FROM activos a

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE a.id_activo = $1
      FOR UPDATE OF a;
      `,
      [id]
    );

    if (activoActual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    const activo = activoActual.rows[0];

    if (activo.estado !== "En uso") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo debe estar en uso para cambiar de usuario"
      });
    }

    const usuarioResultado = await client.query(
      `
      SELECT
        id_usuario,
        CONCAT(nombre, ' ', apellidos) AS nombre_completo,
        estado
      FROM usuarios
      WHERE id_usuario = $1;
      `,
      [id_usuario]
    );

    if (usuarioResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const usuarioNuevo = usuarioResultado.rows[0];

    if (usuarioNuevo.estado === "Inactivo") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "No se puede asignar el activo a un usuario inactivo"
      });
    }

    const razonResultado = await client.query(
      `
      SELECT nombre
      FROM razones_sociales
      WHERE id_razon_social = $1;
      `,
      [id_razon_social]
    );

    if (razonResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Razón social no encontrada"
      });
    }

    const areaResultado = await client.query(
      `
      SELECT nombre
      FROM areas
      WHERE id_area = $1;
      `,
      [id_area]
    );

    if (areaResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Área no encontrada"
      });
    }

    let nombreNave = null;

    if (id_nave) {
      const naveResultado = await client.query(
        `
        SELECT nombre
        FROM naves
        WHERE id_nave = $1;
        `,
        [id_nave]
      );

      if (naveResultado.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          mensaje: "Nave no encontrada"
        });
      }

      nombreNave = naveResultado.rows[0].nombre;
    }

    let nombreUbicacion = null;

    if (id_ubicacion) {
      const ubicacionResultado = await client.query(
        `
        SELECT nombre
        FROM ubicaciones
        WHERE id_ubicacion = $1;
        `,
        [id_ubicacion]
      );

      if (ubicacionResultado.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          mensaje: "Ubicación no encontrada"
        });
      }

      nombreUbicacion = ubicacionResultado.rows[0].nombre;
    }

    await client.query(
      `
      UPDATE activos
      SET
        id_usuario = $1,
        id_razon_social = $2,
        id_area = $3,
        id_nave = $4,
        id_ubicacion = $5,
        fecha_asignacion = CURRENT_TIMESTAMP
      WHERE id_activo = $6;
      `,
      [
        id_usuario,
        id_razon_social,
        id_area,
        id_nave || null,
        id_ubicacion || null,
        id
      ]
    );

    await client.query(
      `
      INSERT INTO movimientos (
        id_activo,
        tipo_movimiento,

        id_usuario_anterior,
        usuario_anterior,
        id_razon_social_anterior,
        razon_social_anterior,
        id_area_anterior,
        area_anterior,
        id_nave_anterior,
        nave_anterior,
        id_ubicacion_anterior,
        ubicacion_anterior,
        estado_anterior,

        id_usuario_nuevo,
        usuario_nuevo,
        id_razon_social_nueva,
        razon_social_nueva,
        id_area_nueva,
        area_nueva,
        id_nave_nueva,
        nave_nueva,
        id_ubicacion_nueva,
        ubicacion_nueva,
        estado_nuevo
      )
      VALUES (
        $1,
        'Cambio de usuario',

        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,

        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,
        $22,
        'En uso'
      );
      `,
      [
        id,

        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        activo.id_area,
        activo.area_actual,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado,

        id_usuario,
        usuarioNuevo.nombre_completo,

        id_razon_social,
        razonResultado.rows[0].nombre,

        id_area,
        areaResultado.rows[0].nombre,

        id_nave || null,
        nombreNave,

        id_ubicacion || null,
        nombreUbicacion
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Usuario del activo actualizado correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error al cambiar usuario del activo:", error);

    res.status(500).json({
      mensaje: "Error al cambiar el usuario del activo"
    });

  } finally {
    client.release();
  }
};

export const cambiarAreaActivo = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { id_area } = req.body;

    if (!id_area) {
      return res.status(400).json({
        mensaje: "El área es obligatoria"
      });
    }

    await client.query("BEGIN");

    const activoActual = await client.query(
      `
      SELECT
        a.*,
        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_actual,
        rs.nombre AS razon_social_actual,
        ar.nombre AS area_actual,
        n.nombre AS nave_actual,
        ub.nombre AS ubicacion_actual
      FROM activos a

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE a.id_activo = $1
      FOR UPDATE OF a;
      `,
      [id]
    );

    if (activoActual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    const activo = activoActual.rows[0];

    if (activo.estado !== "En uso") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo debe estar en uso para cambiar de área"
      });
    }

    if (Number(activo.id_area) === Number(id_area)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo ya pertenece a esa área"
      });
    }

    const areaNuevaResultado = await client.query(
      `
      SELECT
        id_area,
        nombre
      FROM areas
      WHERE id_area = $1;
      `,
      [id_area]
    );

    if (areaNuevaResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Área no encontrada"
      });
    }

    const areaNueva = areaNuevaResultado.rows[0];

    await client.query(
      `
      UPDATE activos
      SET id_area = $1
      WHERE id_activo = $2;
      `,
      [id_area, id]
    );

    await client.query(
      `
      INSERT INTO movimientos (
        id_activo,
        tipo_movimiento,

        id_usuario_anterior,
        usuario_anterior,
        id_razon_social_anterior,
        razon_social_anterior,
        id_area_anterior,
        area_anterior,
        id_nave_anterior,
        nave_anterior,
        id_ubicacion_anterior,
        ubicacion_anterior,
        estado_anterior,

        id_usuario_nuevo,
        usuario_nuevo,
        id_razon_social_nueva,
        razon_social_nueva,
        id_area_nueva,
        area_nueva,
        id_nave_nueva,
        nave_nueva,
        id_ubicacion_nueva,
        ubicacion_nueva,
        estado_nuevo
      )
      VALUES (
        $1,
        'Cambio de área',

        $2, $3,
        $4, $5,
        $6, $7,
        $8, $9,
        $10, $11,
        $12,

        $13, $14,
        $15, $16,
        $17, $18,
        $19, $20,
        $21, $22,
        $23
      );
      `,
      [
        id,

        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        activo.id_area,
        activo.area_actual,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado,

        // Después del cambio:
        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        id_area,
        areaNueva.nombre,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Área del activo actualizada correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error al cambiar área del activo:", error);

    res.status(500).json({
      mensaje: "Error al cambiar el área del activo"
    });

  } finally {
    client.release();
  }
};

export const cambiarRazonSocialActivo = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { id_razon_social } = req.body;

    if (!id_razon_social) {
      return res.status(400).json({
        mensaje: "La razón social es obligatoria"
      });
    }

    await client.query("BEGIN");

    const activoActual = await client.query(
      `
      SELECT
        a.*,
        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_actual,
        rs.nombre AS razon_social_actual,
        ar.nombre AS area_actual,
        n.nombre AS nave_actual,
        ub.nombre AS ubicacion_actual
      FROM activos a

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE a.id_activo = $1
      FOR UPDATE OF a;
      `,
      [id]
    );

    if (activoActual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    const activo = activoActual.rows[0];

    if (activo.estado !== "En uso") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo debe estar en uso para cambiar de razón social"
      });
    }

    if (
      Number(activo.id_razon_social) === Number(id_razon_social)
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo ya pertenece a esa razón social"
      });
    }

    const razonNuevaResultado = await client.query(
      `
      SELECT
        id_razon_social,
        nombre
      FROM razones_sociales
      WHERE id_razon_social = $1;
      `,
      [id_razon_social]
    );

    if (razonNuevaResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Razón social no encontrada"
      });
    }

    const razonNueva = razonNuevaResultado.rows[0];

    await client.query(
      `
      UPDATE activos
      SET id_razon_social = $1
      WHERE id_activo = $2;
      `,
      [id_razon_social, id]
    );

    await client.query(
      `
      INSERT INTO movimientos (
        id_activo,
        tipo_movimiento,

        id_usuario_anterior,
        usuario_anterior,
        id_razon_social_anterior,
        razon_social_anterior,
        id_area_anterior,
        area_anterior,
        id_nave_anterior,
        nave_anterior,
        id_ubicacion_anterior,
        ubicacion_anterior,
        estado_anterior,

        id_usuario_nuevo,
        usuario_nuevo,
        id_razon_social_nueva,
        razon_social_nueva,
        id_area_nueva,
        area_nueva,
        id_nave_nueva,
        nave_nueva,
        id_ubicacion_nueva,
        ubicacion_nueva,
        estado_nuevo
      )
      VALUES (
        $1,
        'Cambio de razón social',

        $2, $3,
        $4, $5,
        $6, $7,
        $8, $9,
        $10, $11,
        $12,

        $13, $14,
        $15, $16,
        $17, $18,
        $19, $20,
        $21, $22,
        $23
      );
      `,
      [
        id,

        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        activo.id_area,
        activo.area_actual,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado,

        // Datos nuevos
        activo.id_usuario,
        activo.usuario_actual,

        id_razon_social,
        razonNueva.nombre,

        activo.id_area,
        activo.area_actual,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Razón social del activo actualizada correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Error al cambiar razón social del activo:",
      error
    );

    res.status(500).json({
      mensaje: "Error al cambiar la razón social del activo"
    });

  } finally {
    client.release();
  }
};

export const cambiarUbicacionActivo = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { id_nave, id_ubicacion } = req.body;

    if (!id_ubicacion) {
      return res.status(400).json({
        mensaje: "La ubicación es obligatoria"
      });
    }

    await client.query("BEGIN");

    const activoActual = await client.query(
      `
      SELECT
        a.*,
        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_actual,
        rs.nombre AS razon_social_actual,
        ar.nombre AS area_actual,
        n.nombre AS nave_actual,
        ub.nombre AS ubicacion_actual
      FROM activos a

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE a.id_activo = $1
      FOR UPDATE OF a;
      `,
      [id]
    );

    if (activoActual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    const activo = activoActual.rows[0];

    if (activo.estado !== "En uso") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo debe estar en uso para cambiar de ubicación"
      });
    }

    let nombreNave = null;

    if (id_nave) {
      const naveResultado = await client.query(
        `
        SELECT nombre
        FROM naves
        WHERE id_nave = $1;
        `,
        [id_nave]
      );

      if (naveResultado.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          mensaje: "Nave no encontrada"
        });
      }

      nombreNave = naveResultado.rows[0].nombre;
    }

    const ubicacionResultado = await client.query(
      `
      SELECT
        nombre,
        id_nave,
        id_razon_social
      FROM ubicaciones
      WHERE id_ubicacion = $1;
      `,
      [id_ubicacion]
    );

    if (ubicacionResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Ubicación no encontrada"
      });
    }

    const ubicacionNueva = ubicacionResultado.rows[0];

    await client.query(
      `
      UPDATE activos
      SET
        id_nave = $1,
        id_ubicacion = $2
      WHERE id_activo = $3;
      `,
      [
        id_nave || null,
        id_ubicacion,
        id
      ]
    );

    await client.query(
      `
      INSERT INTO movimientos (
        id_activo,
        tipo_movimiento,

        id_usuario_anterior,
        usuario_anterior,
        id_razon_social_anterior,
        razon_social_anterior,
        id_area_anterior,
        area_anterior,
        id_nave_anterior,
        nave_anterior,
        id_ubicacion_anterior,
        ubicacion_anterior,
        estado_anterior,

        id_usuario_nuevo,
        usuario_nuevo,
        id_razon_social_nueva,
        razon_social_nueva,
        id_area_nueva,
        area_nueva,
        id_nave_nueva,
        nave_nueva,
        id_ubicacion_nueva,
        ubicacion_nueva,
        estado_nuevo
      )
      VALUES (
        $1,
        'Cambio de ubicación',

        $2, $3,
        $4, $5,
        $6, $7,
        $8, $9,
        $10, $11,
        $12,

        $13, $14,
        $15, $16,
        $17, $18,
        $19, $20,
        $21, $22,
        $23
      );
      `,
      [
        id,

        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        activo.id_area,
        activo.area_actual,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado,

        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        activo.id_area,
        activo.area_actual,

        id_nave || null,
        nombreNave,

        id_ubicacion,
        ubicacionNueva.nombre,

        activo.estado
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Ubicación del activo actualizada correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error al cambiar ubicación del activo:", error);

    res.status(500).json({
      mensaje: "Error al cambiar la ubicación del activo"
    });

  } finally {
    client.release();
  }
};

export const darDeBajaActivo = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { motivo_baja } = req.body;

    if (!motivo_baja || !motivo_baja.trim()) {
      return res.status(400).json({
        mensaje: "El motivo de baja es obligatorio"
      });
    }

    await client.query("BEGIN");

    // 1. Obtener el estado actual del activo
    const activoActual = await client.query(
      `
      SELECT
        a.*,
        CONCAT(u.nombre, ' ', u.apellidos) AS usuario_actual,
        rs.nombre AS razon_social_actual,
        ar.nombre AS area_actual,
        n.nombre AS nave_actual,
        ub.nombre AS ubicacion_actual
      FROM activos a

      LEFT JOIN usuarios u
        ON a.id_usuario = u.id_usuario

      LEFT JOIN razones_sociales rs
        ON a.id_razon_social = rs.id_razon_social

      LEFT JOIN areas ar
        ON a.id_area = ar.id_area

      LEFT JOIN naves n
        ON a.id_nave = n.id_nave

      LEFT JOIN ubicaciones ub
        ON a.id_ubicacion = ub.id_ubicacion

      WHERE a.id_activo = $1
      FOR UPDATE OF a;
      `,
      [id]
    );

    if (activoActual.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        mensaje: "Activo no encontrado"
      });
    }

    const activo = activoActual.rows[0];

    // 2. Evitar una segunda baja
    if (activo.estado === "Baja") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        mensaje: "El activo ya se encuentra dado de baja"
      });
    }

    // 3. Actualizar el activo
    await client.query(
      `
      UPDATE activos
      SET
        estado = 'Baja',
        fecha_baja = CURRENT_TIMESTAMP,
        motivo_baja = $1,
        id_usuario = NULL,
        id_razon_social = NULL,
        id_area = NULL,
        id_nave = NULL,
        id_ubicacion = NULL,
        fecha_asignacion = NULL
      WHERE id_activo = $2;
      `,
      [
        motivo_baja.trim(),
        id
      ]
    );

    // 4. Guardar el movimiento
    await client.query(
      `
      INSERT INTO movimientos (
        id_activo,
        tipo_movimiento,

        id_usuario_anterior,
        usuario_anterior,
        id_razon_social_anterior,
        razon_social_anterior,
        id_area_anterior,
        area_anterior,
        id_nave_anterior,
        nave_anterior,
        id_ubicacion_anterior,
        ubicacion_anterior,
        estado_anterior,

        id_usuario_nuevo,
        usuario_nuevo,
        id_razon_social_nueva,
        razon_social_nueva,
        id_area_nueva,
        area_nueva,
        id_nave_nueva,
        nave_nueva,
        id_ubicacion_nueva,
        ubicacion_nueva,
        estado_nuevo
      )
      VALUES (
        $1,
        'Baja',

        $2, $3,
        $4, $5,
        $6, $7,
        $8, $9,
        $10, $11,
        $12,

        NULL, NULL,
        NULL, NULL,
        NULL, NULL,
        NULL, NULL,
        NULL, NULL,
        'Baja'
      );
      `,
      [
        id,

        activo.id_usuario,
        activo.usuario_actual,

        activo.id_razon_social,
        activo.razon_social_actual,

        activo.id_area,
        activo.area_actual,

        activo.id_nave,
        activo.nave_actual,

        activo.id_ubicacion,
        activo.ubicacion_actual,

        activo.estado
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensaje: "Activo dado de baja correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error al dar de baja el activo:", error);

    res.status(500).json({
      mensaje: "Error al dar de baja el activo"
    });

  } finally {
    client.release();
  }
};