import { Router } from "express";

import {
  obtenerUsuarios,
  buscarUsuarioPorNomina,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearCuentaUsuario
} from "../controllers/usuarios.controller";

import {
  verificarToken,
  soloAdministrador
} from "../middlewares/auth.middleware";

const router = Router();

// Todas las funciones de usuarios
// son exclusivas del Administrador.

// Listar usuarios
router.get(
  "/",
  verificarToken,
  soloAdministrador,
  obtenerUsuarios
);

// Buscar usuario por número de nómina
router.get(
  "/nomina/:nomina",
  verificarToken,
  soloAdministrador,
  buscarUsuarioPorNomina
);

// Registrar usuario
router.post(
  "/",
  verificarToken,
  soloAdministrador,
  crearUsuario
);

// Editar usuario
router.put(
  "/:id",
  verificarToken,
  soloAdministrador,
  actualizarUsuario
);

// Activar o desactivar usuario
router.patch(
  "/:id/estado",
  verificarToken,
  soloAdministrador,
  cambiarEstadoUsuario
);

// Crear cuenta de acceso para un usuario
// Solo Administrador

router.post(
  "/:id/cuenta",
  verificarToken,
  soloAdministrador,
  crearCuentaUsuario
);
export default router;