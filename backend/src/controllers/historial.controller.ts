import { Request, Response } from "express";
import { pool } from "../config/database";

// =====================================================
// HISTORIAL GENERAL
// =====================================================

export const obtenerHistorialGeneral = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      id_activo,
      tipo_movimiento,
      fecha_desde,
      fecha_hasta
    } = req.query;

    let consulta = `
      SELECT
        m.id_movimiento,
        m.id_activo,
        a.codigo_activo,

        m.fecha_hora,
        m.tipo_movimiento,

        m.usuario_anterior,
        m.razon_social_anterior,
        m.area_anterior,
        m.nave_anterior,
        m.ubicacion_anterior,
        m.estado_anterior,

        m.usuario_nuevo,
        m.razon_social_nueva,
        m.area_nueva,
        m.nave_nueva,
        m.ubicacion_nueva,
        m.estado_nuevo,

        m.observaciones

      FROM movimientos m

      INNER JOIN activos a
        ON m.id_activo = a.id_activo

      WHERE 1 = 1
    `;

    const valores: any[] = [];
    let contador = 1;

    if (id_activo) {
      consulta += `
        AND m.id_activo = $${contador}
      `;

      valores.push(id_activo);
      contador++;
    }

    if (tipo_movimiento) {
      consulta += `
        AND m.tipo_movimiento = $${contador}
      `;

      valores.push(tipo_movimiento);
      contador++;
    }

    if (fecha_desde) {
      consulta += `
        AND m.fecha_hora >= $${contador}
      `;

      valores.push(fecha_desde);
      contador++;
    }

    if (fecha_hasta) {
      consulta += `
        AND m.fecha_hora < ($${contador}::date + INTERVAL '1 day')
      `;

      valores.push(fecha_hasta);
      contador++;
    }

    consulta += `
      ORDER BY
        m.fecha_hora DESC,
        m.id_movimiento DESC;
    `;

    const resultado = await pool.query(
      consulta,
      valores
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error(
      "Error al consultar historial general:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al consultar el historial general"
    });
  }
};

// =====================================================
// HISTORIAL DE UN ACTIVO
// =====================================================

export const obtenerHistorialActivo = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      SELECT
        m.id_movimiento,
        m.id_activo,
        m.fecha_hora,
        m.tipo_movimiento,

        m.usuario_anterior,
        m.razon_social_anterior,
        m.area_anterior,
        m.nave_anterior,
        m.ubicacion_anterior,
        m.estado_anterior,

        m.usuario_nuevo,
        m.razon_social_nueva,
        m.area_nueva,
        m.nave_nueva,
        m.ubicacion_nueva,
        m.estado_nuevo,

        m.observaciones

      FROM movimientos m

      WHERE m.id_activo = $1

      ORDER BY
        m.fecha_hora DESC,
        m.id_movimiento DESC;
      `,
      [id]
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error(
      "Error al consultar historial:",
      error
    );

    res.status(500).json({
      mensaje:
        "Error al consultar el historial"
    });
  }
};