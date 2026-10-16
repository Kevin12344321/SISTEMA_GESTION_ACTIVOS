import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoEmpresa from "../components/LogoEmpresa";

type Activo = {
  id_activo: number;
  codigo_activo: string;
  tipo_activo: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  estado: string;
  usuario_responsable: string | null;
  razon_social: string | null;
  area: string | null;
  nave: string | null;
  ubicacion: string | null;
};

type UsuarioSesion = {
  id_usuario: number;
  nombre: string;
  apellidos: string;
  nombre_usuario: string;
  rol: string;
};

function Activos() {
  const navigate = useNavigate();

  const [activos, setActivos] = useState<Activo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const usuarioGuardado =
    localStorage.getItem("usuario");

  const usuario: UsuarioSesion | null =
    usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null;

  const esAdministrador =
    usuario?.rol === "Administrador";

  const obtenerToken = () => {
    return localStorage.getItem("token");
  };

  const cargarActivos = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const token = obtenerToken();

      const respuesta = await api.get(
        "/activos",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setActivos(respuesta.data);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cargar los activos"
      );

    } finally {
      setCargando(false);
    }
  };

  const buscarActivos = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const token = obtenerToken();

      if (!busqueda.trim()) {
        await cargarActivos();
        return;
      }

      const respuesta = await api.get(
        `/activos/buscar?q=${encodeURIComponent(
          busqueda
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setActivos(respuesta.data);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible realizar la búsqueda"
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarActivos();
  }, []);

  return (
    <div className="activos-page">

      <header className="activos-header">

        <div>
  <LogoEmpresa />

  <div style={{ marginTop: "12px" }}>
    <h1>Activos</h1>

    <p>
      Consulta los activos registrados
      en el sistema.
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

          {esAdministrador && (
            <button
              className="primary-action-button"
              style={{
                width: "auto",
                margin: 0
              }}
              onClick={() =>
                navigate("/activos/nuevo")
              }
            >
              + Registrar activo
            </button>
          )}

          <button
            className="secondary-button"
            onClick={() => navigate("/")}
          >
            Volver
          </button>

        </div>

      </header>

      <main className="activos-content">

        <section className="search-section">

          <input
            type="text"
            placeholder="Buscar por ID, serie, marca, modelo, usuario, área..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                buscarActivos();
              }
            }}
          />

          <button
            onClick={buscarActivos}
          >
            Buscar
          </button>

          <button
            className="secondary-button"
            onClick={() => {
              setBusqueda("");
              cargarActivos();
            }}
          >
            Limpiar
          </button>

        </section>

        {mensaje && (
          <div className="page-message">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <p>Cargando activos...</p>
        ) : (
          <div className="table-container">

            <table className="activos-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Marca</th>
                  <th>Tipo de activo</th>
                  <th>Estado</th>
                  <th>Área</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {activos.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      No se encontraron activos.
                    </td>
                  </tr>
                ) : (
                  activos.map((activo) => (
                    <tr
                      key={activo.id_activo}
                    >

                      <td>
                        {activo.codigo_activo}
                      </td>

                      <td>
                        {activo.marca || "—"}
                      </td>

                      <td>
                        {activo.tipo_activo}
                      </td>

                      <td>
                        {activo.estado}
                      </td>

                      <td>
                        {activo.area || "—"}
                      </td>

                      <td>
                        <button
                          className="table-button"
                          onClick={() =>
                            navigate(
                              `/activos/${activo.id_activo}`
                            )
                          }
                        >
                          Ver detalles
                        </button>
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

export default Activos;