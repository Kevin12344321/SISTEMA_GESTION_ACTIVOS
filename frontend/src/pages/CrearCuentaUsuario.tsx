import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function CrearCuentaUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmarPassword, setConfirmarPassword] =
    useState("");

  const [rol, setRol] =
    useState("Consulta");

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const token =
    localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const crearCuenta = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMensaje("");

    if (!nombreUsuario.trim()) {
      setMensaje(
        "El nombre de usuario es obligatorio."
      );
      return;
    }

    if (!password) {
      setMensaje(
        "La contraseña es obligatoria."
      );
      return;
    }

    if (password.length < 6) {
      setMensaje(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmarPassword) {
      setMensaje(
        "Las contraseñas no coinciden."
      );
      return;
    }

    try {
      setCargando(true);

      const respuesta = await api.post(
        `/usuarios/${id}/cuenta`,
        {
          nombre_usuario:
            nombreUsuario.trim(),
          password,
          rol
        },
        {
          headers
        }
      );

      window.alert(
        respuesta.data?.mensaje ||
        "Cuenta creada correctamente"
      );

      navigate("/usuarios");

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible crear la cuenta"
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="detalle-page">

      <header className="detalle-header">

        <div>
          <h1>Crear cuenta de acceso</h1>

          <p>
            Asigna credenciales para ingresar
            al Sistema de Gestión de Activos.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/usuarios")
          }
        >
          Cancelar
        </button>

      </header>

      <main className="form-page-content">

        <form
          className="movimiento-form"
          onSubmit={crearCuenta}
        >

          {mensaje && (
            <div className="page-message">
              {mensaje}
            </div>
          )}

          <div className="form-group">
            <label>
              Nombre de usuario
            </label>

            <input
              type="text"
              value={nombreUsuario}
              onChange={(e) =>
                setNombreUsuario(
                  e.target.value
                )
              }
              placeholder="Ej. juan.perez"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>
              Confirmar contraseña
            </label>

            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(
                  e.target.value
                )
              }
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>
              Rol
            </label>

            <select
              value={rol}
              onChange={(e) =>
                setRol(e.target.value)
              }
            >
              <option value="Consulta">
                Consulta
              </option>

              <option value="Administrador">
                Administrador
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="primary-action-button"
            disabled={cargando}
          >
            {cargando
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default CrearCuentaUsuario;