import { Router } from "express";

import {
  obtenerTiposActivo,
  crearTipoActivo,
  actualizarTipoActivo,

  obtenerRazonesSociales,
  crearRazonSocial,
  actualizarRazonSocial,

  obtenerAreas,
  crearArea,
  actualizarArea,

  obtenerNaves,
  crearNave,
  actualizarNave,

  obtenerUbicaciones,
  crearUbicacion,
  actualizarUbicacion
} from "../controllers/catalogos.controller";

import {
  verificarToken,
  soloAdministrador
} from "../middlewares/auth.middleware";

const router = Router();

// =====================================================
// TIPOS DE ACTIVO
// =====================================================

router.get(
  "/tipos-activo",
  verificarToken,
  obtenerTiposActivo
);

router.post(
  "/tipos-activo",
  verificarToken,
  soloAdministrador,
  crearTipoActivo
);

router.put(
  "/tipos-activo/:id",
  verificarToken,
  soloAdministrador,
  actualizarTipoActivo
);

// =====================================================
// RAZONES SOCIALES
// =====================================================

router.get(
  "/razones-sociales",
  verificarToken,
  obtenerRazonesSociales
);

router.post(
  "/razones-sociales",
  verificarToken,
  soloAdministrador,
  crearRazonSocial
);

router.put(
  "/razones-sociales/:id",
  verificarToken,
  soloAdministrador,
  actualizarRazonSocial
);

// =====================================================
// ÁREAS
// =====================================================

router.get(
  "/areas",
  verificarToken,
  obtenerAreas
);

router.post(
  "/areas",
  verificarToken,
  soloAdministrador,
  crearArea
);

router.put(
  "/areas/:id",
  verificarToken,
  soloAdministrador,
  actualizarArea
);

// =====================================================
// NAVES
// =====================================================

router.get(
  "/naves",
  verificarToken,
  obtenerNaves
);

router.post(
  "/naves",
  verificarToken,
  soloAdministrador,
  crearNave
);

router.put(
  "/naves/:id",
  verificarToken,
  soloAdministrador,
  actualizarNave
);

// =====================================================
// UBICACIONES
// =====================================================

router.get(
  "/ubicaciones",
  verificarToken,
  obtenerUbicaciones
);

router.post(
  "/ubicaciones",
  verificarToken,
  soloAdministrador,
  crearUbicacion
);

router.put(
  "/ubicaciones/:id",
  verificarToken,
  soloAdministrador,
  actualizarUbicacion
);

export default router;