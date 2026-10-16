import { Router } from "express";

import {
  prepararAsignacion
} from "../controllers/asignaciones.controller";

import {
  verificarToken,
  soloAdministrador
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/preparar",
  verificarToken,
  soloAdministrador,
  prepararAsignacion
);

export default router;