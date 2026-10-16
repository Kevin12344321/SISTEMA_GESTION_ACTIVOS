import { Request, Response } from "express";
import { pool } from "../config/database";

export const prepararAsignacion = async (
  req: Request,
  res: Response
) => {
  try {
    const { numero_nomina } = req.body;

    if (!numero_nomina) {
      return res.status(400).json({
        mensaje: "El número de nómina es obligatorio"
      });
    }

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
      [numero_nomina]
    );

    if (resultado.rows.length === 0) {
      return res.json({
        existe: false,
        mensaje: "El usuario no está registrado"
      });
    }

    res.json({
      existe: true,
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error("Error al preparar asignación:", error);

    res.status(500).json({
      mensaje: "Error al preparar la asignación"
    });
  }
};