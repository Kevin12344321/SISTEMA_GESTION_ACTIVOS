import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoEmpresa from "../components/LogoEmpresa";

type Activo = {
  id_activo: number;
  codigo_activo: string;
};

type Movimiento = {
  id_movimiento: number;
  id_activo: number;
  codigo_activo: string;

  fecha_hora: string;
  tipo_movimiento: string;

  usuario_anterior: string | null;
  razon_social_anterior: string | null;
  area_anterior: string | null;
  nave_anterior: string | null;
  ubicacion_anterior: string | null;
  estado_anterior: string | null;

  usuario_nuevo: string | null;
  razon_social_nueva: string | null;
  area_nueva: string | null;
  nave_nueva: string | null;
  ubicacion_nueva: string | null;
  estado_nuevo: string | null;

  observaciones: string | null;
};

function Historial() {
  const navigate = useNavigate();

  const [movimientos, setMovimientos] =
    useState<Movimiento[]>([]);

  const [activos, setActivos] =
    useState<Activo[]>([]);

  const [idActivo, setIdActivo] =
    useState("");

  const [tipoMovimiento, setTipoMovimiento] =
    useState("");

  const [fechaDesde, setFechaDesde] =
    useState("");

  const [fechaHasta, setFechaHasta] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const cargarActivos = async () => {
    try {
      const respuesta = await api.get(
        "/activos",
        {
          headers
        }
      );

      setActivos(respuesta.data);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cargar los activos"
      );
    }
  };

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const parametros = new URLSearchParams();

      if (idActivo) {
        parametros.append(
          "id_activo",
          idActivo
        );
      }

      if (tipoMovimiento) {
        parametros.append(
          "tipo_movimiento",
          tipoMovimiento
        );
      }

      if (fechaDesde) {
        parametros.append(
          "fecha_desde",
          fechaDesde
        );
      }

      if (fechaHasta) {
        parametros.append(
          "fecha_hasta",
          fechaHasta
        );
      }

      const query = parametros.toString();

      const respuesta = await api.get(
        query
          ? `/historial?${query}`
          : "/historial",
        {
          headers
        }
      );

      setMovimientos(respuesta.data);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cargar el historial"
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarActivos();
    cargarHistorial();
  }, []);

  const buscar = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    cargarHistorial();
  };

  const limpiarFiltros = () => {
    setIdActivo("");
    setTipoMovimiento("");
    setFechaDesde("");
    setFechaHasta("");

    setTimeout(() => {
      cargarHistorialSinFiltros();
    }, 0);
  };

  const cargarHistorialSinFiltros = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const respuesta = await api.get(
        "/historial",
        {
          headers
        }
      );

      setMovimientos(respuesta.data);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cargar el historial"
      );

    } finally {
      setCargando(false);
    }
  };

  const tiposMovimiento = [
    "Asignación",
    "Devolución a almacén",
    "Cambio de usuario",
    "Cambio de área",
    "Cambio de razón social",
    "Cambio de ubicación",
    "Baja"
  ];

  return (
    <div className="activos-page">

      <header className="activos-header">

  <div>
    <LogoEmpresa />

    <div style={{ marginTop: "12px" }}>
      <h1>Historial</h1>

      <p>
        Consulta los movimientos realizados
        sobre los activos del sistema.
      </p>
    </div>
  </div>

  <button
    className="secondary-button"
    onClick={() => navigate("/")}
  >
    Volver
  </button>

</header>

      <main className="activos-content">

        {mensaje && (
          <div className="page-message">
            {mensaje}
          </div>
        )}

        <form
          className="historial-filtros"
          onSubmit={buscar}
        >

          <div className="form-group">
            <label>Activo</label>

            <select
              value={idActivo}
              onChange={(e) =>
                setIdActivo(e.target.value)
              }
            >
              <option value="">
                Todos los activos
              </option>

              {activos.map((activo) => (
                <option
                  key={activo.id_activo}
                  value={activo.id_activo}
                >
                  {activo.codigo_activo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Tipo de movimiento
            </label>

            <select
              value={tipoMovimiento}
              onChange={(e) =>
                setTipoMovimiento(
                  e.target.value
                )
              }
            >
              <option value="">
                Todos los movimientos
              </option>

              {tiposMovimiento.map((tipo) => (
                <option
                  key={tipo}
                  value={tipo}
                >
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Desde</label>

            <input
              type="date"
              value={fechaDesde}
              onChange={(e) =>
                setFechaDesde(
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Hasta</label>

            <input
              type="date"
              value={fechaHasta}
              onChange={(e) =>
                setFechaHasta(
                  e.target.value
                )
              }
            />
          </div>

          <div className="historial-filtros-botones">

            <button
              type="submit"
              className="primary-action-button"
              style={{
                width: "auto",
                margin: 0
              }}
            >
              Buscar
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>

          </div>

        </form>

        {cargando ? (
          <p>Cargando historial...</p>
        ) : movimientos.length === 0 ? (
          <div className="historial-vacio">
            No se encontraron movimientos.
          </div>
        ) : (
          <div className="historial-general-lista">

            {movimientos.map(
              (movimiento) => (
                <article
                  key={
                    movimiento.id_movimiento
                  }
                  className="movimiento-card"
                >

                  <div className="movimiento-header">

                    <div>
                      <h3>
                        {
                          movimiento.tipo_movimiento
                        }
                      </h3>

                      <span>
                        {
                          movimiento.codigo_activo
                        }
                        {" · "}
                        Movimiento #
                        {
                          movimiento.id_movimiento
                        }
                      </span>
                    </div>

                    <time>
                      {new Date(
                        movimiento.fecha_hora
                      ).toLocaleString()}
                    </time>

                  </div>

                  <div className="movimiento-comparacion">

                    <div>
                      <h4>Anterior</h4>

                      <p>
                        <strong>
                          Usuario:
                        </strong>{" "}
                        {
                          movimiento.usuario_anterior ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Razón social:
                        </strong>{" "}
                        {
                          movimiento.razon_social_anterior ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Área:
                        </strong>{" "}
                        {
                          movimiento.area_anterior ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Nave:
                        </strong>{" "}
                        {
                          movimiento.nave_anterior ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Ubicación:
                        </strong>{" "}
                        {
                          movimiento.ubicacion_anterior ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Estado:
                        </strong>{" "}
                        {
                          movimiento.estado_anterior ||
                          "—"
                        }
                      </p>
                    </div>

                    <div>
                      <h4>Nuevo</h4>

                      <p>
                        <strong>
                          Usuario:
                        </strong>{" "}
                        {
                          movimiento.usuario_nuevo ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Razón social:
                        </strong>{" "}
                        {
                          movimiento.razon_social_nueva ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Área:
                        </strong>{" "}
                        {
                          movimiento.area_nueva ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Nave:
                        </strong>{" "}
                        {
                          movimiento.nave_nueva ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Ubicación:
                        </strong>{" "}
                        {
                          movimiento.ubicacion_nueva ||
                          "—"
                        }
                      </p>

                      <p>
                        <strong>
                          Estado:
                        </strong>{" "}
                        {
                          movimiento.estado_nuevo ||
                          "—"
                        }
                      </p>
                    </div>

                  </div>

                  {movimiento.observaciones && (
                    <div className="movimiento-observaciones">
                      <strong>
                        Observaciones:
                      </strong>{" "}
                      {
                        movimiento.observaciones
                      }
                    </div>
                  )}

                  <button
                    className="table-button"
                    style={{
                      marginTop: "15px"
                    }}
                    onClick={() =>
                      navigate(
                        `/activos/${movimiento.id_activo}`
                      )
                    }
                  >
                    Ver activo
                  </button>

                </article>
              )
            )}

          </div>
        )}

      </main>

    </div>
  );
}

export default Historial;