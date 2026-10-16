import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Activos from "./pages/Activos";
import RegistrarActivo from "./pages/RegistrarActivo";
import ActivoDetalle from "./pages/DetalleActivo";
import HistorialActivo from "./pages/HistorialActivo";
import AsignarActivo from "./pages/AsignarActivo";
import CambiarUsuario from "./pages/CambiarUsuario";
import CambiarArea from "./pages/CambiarArea";
import CambiarRazonSocial from "./pages/CambiarRazonSocial";
import CambiarUbicacion from "./pages/CambiarUbicacion";
import DarBajaActivo from "./pages/DarBajaActivo";

import Usuarios from "./pages/Usuarios";
import RegistrarUsuario from "./pages/RegistrarUsuario";
import EditarUsuario from "./pages/EditarUsuario";
import CrearCuentaUsuario from "./pages/CrearCuentaUsuario";

import Catalogos from "./pages/Catalogos";
import Historial from "./pages/Historial";

function App() {

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const iniciarSesion = (nuevoToken: string) => {
    setToken(nuevoToken);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
  };

  return (
    <BrowserRouter>

      <Routes>

        {/* =====================
            LOGIN
        ===================== */}

        <Route
          path="/login"
          element={
            token
              ? (
                <Navigate
                  to="/"
                  replace
                />
              )
              : (
                <Login
                  onLogin={iniciarSesion}
                />
              )
          }
        />

        {/* =====================
            DASHBOARD
        ===================== */}

        <Route
          path="/"
          element={
            token
              ? (
                <Dashboard
                  onLogout={cerrarSesion}
                />
              )
              : (
                <Navigate
                  to="/login"
                  replace
                />
              )
          }
        />

        {/* =====================
            ACTIVOS
        ===================== */}

        <Route
          path="/activos"
          element={
            token
              ? <Activos />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/nuevo"
          element={
            token
              ? <RegistrarActivo />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/:id"
          element={
            token
              ? <ActivoDetalle />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/:id/asignar"
          element={
            token
              ? <AsignarActivo />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/:id/cambiar-usuario"
          element={
            token
              ? <CambiarUsuario />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/:id/cambiar-area"
          element={
            token
              ? <CambiarArea />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/:id/cambiar-razon-social"
          element={
            token
              ? <CambiarRazonSocial />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/:id/cambiar-ubicacion"
          element={
            token
              ? <CambiarUbicacion />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/activos/:id/baja"
          element={
            token
              ? <DarBajaActivo />
              : <Navigate to="/login" replace />
          }
        />

        {/* =====================
            HISTORIAL
        ===================== */}

        <Route
          path="/historial"
          element={
            token
              ? <Historial />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/historial/activo/:id"
          element={
            token
              ? <HistorialActivo />
              : <Navigate to="/login" replace />
          }
        />

        {/* =====================
            USUARIOS
        ===================== */}

        <Route
          path="/usuarios"
          element={
            token
              ? <Usuarios />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/usuarios/nuevo"
          element={
            token
              ? <RegistrarUsuario />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/usuarios/:nomina/editar"
          element={
            token
              ? <EditarUsuario />
              : <Navigate to="/login" replace />
          }
        />

        <Route
  path="/usuarios/:id/cuenta"
  element={
    token
      ? <CrearCuentaUsuario />
      : <Navigate to="/login" replace />
  }
/>

        {/* =====================
            CATÁLOGOS
        ===================== */}

        <Route
          path="/catalogos"
          element={
            token
              ? <Catalogos />
              : <Navigate to="/login" replace />
          }
        />

        {/* =====================
            RUTA NO ENCONTRADA
        ===================== */}

        <Route
          path="*"
          element={
            token
              ? <Navigate to="/" replace />
              : <Navigate to="/login" replace />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;