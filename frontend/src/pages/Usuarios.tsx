import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoEmpresa from "../components/LogoEmpresa";

type Usuario = {
  id_usuario: number;
  numero_nomina: string;
  nombre: string;
  apellidos: string;
  puesto: string;
  estado: string;
  razon_social: string;
  area: string;
  nave: string | null;
  ubicacion: string | null;

  id_cuenta: number | null;
  nombre_usuario: string | null;
  rol: string | null;
  estado_cuenta: string | null;
};

function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] =
    useState<Usuario[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const token =
    localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const respuesta = await api.get(
        "/usuarios",
        {
          headers
        }
      );

      setUsuarios(respuesta.data);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cargar los usuarios"
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cambiarEstado = async (
    usuario: Usuario
  ) => {
    const nuevoEstado =
      usuario.estado === "Activo"
        ? "Inactivo"
        : "Activo";

    const accion =
      nuevoEstado === "Activo"
        ? "activar"
        : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} al usuario ${usuario.nombre} ${usuario.apellidos}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.patch(
        `/usuarios/${usuario.id_usuario}/estado`,
        {
          estado: nuevoEstado
        },
        {
          headers
        }
      );

      await cargarUsuarios();

    } catch (error: any) {
      window.alert(
        error.response?.data?.mensaje ||
        "No fue posible cambiar el estado del usuario"
      );
    }
  };

  return (
    <div className="activos-page">

      <header className="activos-header">

        <div>

          <LogoEmpresa />

          <div style={{ marginTop: "12px" }}>

            <h1>
              Usuarios
            </h1>

            <p>
              Consulta y administra los usuarios
              registrados.
            </p>

          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >

          <button
            className="primary-action-button"
            style={{
              width: "auto",
              margin: 0
            }}
            onClick={() =>
              navigate("/usuarios/nuevo")
            }
          >
            Registrar usuario
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/")
            }
          >
            Volver
          </button>

        </div>

      </header>

      <main className="activos-content">

        {mensaje && (
          <div className="page-message">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <p>
            Cargando usuarios...
          </p>
        ) : (
          <div className="table-container">

            <table className="activos-table">

              <thead>

                <tr>
                  <th>Nómina</th>
                  <th>Nombre</th>
                  <th>Puesto</th>
                  <th>Razón social</th>
                  <th>Área</th>
                  <th>Estado</th>
                  <th>Cuenta de acceso</th>
                  <th>Acciones</th>
                </tr>

              </thead>

              <tbody>

                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id_usuario}>

                      <td>
                        {usuario.numero_nomina}
                      </td>

                      <td>
                        {usuario.nombre}{" "}
                        {usuario.apellidos}
                      </td>

                      <td>
                        {usuario.puesto}
                      </td>

                      <td>
                        {usuario.razon_social}
                      </td>

                      <td>
                        {usuario.area}
                      </td>

                      <td>
                        {usuario.estado}
                      </td>

                      <td>

                        {usuario.id_cuenta ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px"
                            }}
                          >
                            <strong>
                              {usuario.nombre_usuario}
                            </strong>

                            <span
                              style={{
                                fontSize: "13px"
                              }}
                            >
                              {usuario.rol}
                            </span>

                            <span
                              style={{
                                fontSize: "13px"
                              }}
                            >
                              Cuenta:{" "}
                              {usuario.estado_cuenta}
                            </span>
                          </div>
                        ) : (
                          <span>
                            Sin cuenta
                          </span>
                        )}

                      </td>

                      <td>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap"
                          }}
                        >

                          <button
                            className="table-button"
                            onClick={() =>
                              navigate(
                                `/usuarios/${usuario.numero_nomina}/editar`
                              )
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="table-button"
                            onClick={() =>
                              cambiarEstado(usuario)
                            }
                          >
                            {usuario.estado === "Activo"
                              ? "Desactivar"
                              : "Activar"}
                          </button>

                          {!usuario.id_cuenta &&
                            usuario.estado === "Activo" && (
                              <button
                                className="table-button"
                                onClick={() =>
                                  navigate(
                                    `/usuarios/${usuario.id_usuario}/cuenta`
                                  )
                                }
                              >
                                Crear cuenta
                              </button>
                            )}

                        </div>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        )}

      </main>

    </div>
  );
}

export default Usuarios;