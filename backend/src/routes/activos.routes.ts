import { Router } from "express";

import {
  obtenerActivos,
  buscarActivos,
  crearActivo,
  obtenerActivoPorId,
  asignarActivo,
  devolverActivo,
  cambiarUsuarioActivo,
  cambiarAreaActivo,
  cambiarRazonSocialActivo,
  cambiarUbicacionActivo,
  darDeBajaActivo
} from "../controllers/activos.controller";

import {
  verificarToken,
  soloAdministrador
} from "../middlewares/auth.middleware";

const router = Router();

// =====================================================
// CONSULTAS
// Administrador y Consulta
// =====================================================

router.get("/buscar",verificarToken,buscarActivos);

router.get("/:id",verificarToken,obtenerActivoPorId);

router.get("/",verificarToken,obtenerActivos);

// =====================================================
// ADMINISTRACIÓN
// Solo Administrador
// =====================================================

router.post("/",verificarToken,soloAdministrador,crearActivo);

router.put("/:id/asignar",verificarToken,soloAdministrador,asignarActivo);

router.put("/:id/devolver",verificarToken,soloAdministrador,devolverActivo);

router.put("/:id/cambiar-usuario",verificarToken,soloAdministrador,cambiarUsuarioActivo);

router.put("/:id/cambiar-area",verificarToken,soloAdministrador,cambiarAreaActivo);

router.put("/:id/cambiar-razon-social",verificarToken,soloAdministrador,cambiarRazonSocialActivo);

router.put("/:id/cambiar-ubicacion",verificarToken,soloAdministrador,cambiarUbicacionActivo);

router.put("/:id/baja",verificarToken,soloAdministrador,darDeBajaActivo);

export default router;