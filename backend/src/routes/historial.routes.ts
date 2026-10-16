import { Router } from "express";

import {
  obtenerHistorialGeneral,
  obtenerHistorialActivo
} from "../controllers/historial.controller";

import {
  verificarToken,
  soloAdministrador
} from "../middlewares/auth.middleware";

const router = Router();

// Historial general
router.get(
  "/",
  verificarToken,
  soloAdministrador,
  obtenerHistorialGeneral
);

// Historial de un activo
router.get(
  "/activo/:id",
  verificarToken,
  soloAdministrador,
  obtenerHistorialActivo
);

export default router;