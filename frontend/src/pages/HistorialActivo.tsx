import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

type Movimiento = {
  id_movimiento: number;
  id_activo: number;
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

function HistorialActivo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const token = localStorage.getItem("token");

        const respuesta = await api.get(
          `/historial/activo/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
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

    cargarHistorial();
  }, [id]);

  return (
    <div className="historial-page">

      <header className="detalle-header">
        <div>
          <h1>Historial del activo</h1>
          <p>Movimientos registrados en el sistema</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate(`/activos/${id}`)}
        >
          Volver
        </button>
      </header>

      <main className="historial-content">

        {cargando && <p>Cargando historial...</p>}

        {mensaje && (
          <div className="page-message">
            {mensaje}
          </div>
        )}

        {!cargando &&
          !mensaje &&
          movimientos.length === 0 && (
            <div className="historial-vacio">
              Este activo todavía no tiene movimientos registrados.
            </div>
          )}

        {!cargando &&
          movimientos.map((movimiento) => (
            <article
              className="movimiento-card"
              key={movimiento.id_movimiento}
            >
              <div className="movimiento-header">
                <div>
                  <h3>{movimiento.tipo_movimiento}</h3>

                  <span>
                    Movimiento #{movimiento.id_movimiento}
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
                    <strong>Usuario:</strong>{" "}
                    {movimiento.usuario_anterior || "—"}
                  </p>

                  <p>
                    <strong>Razón social:</strong>{" "}
                    {movimiento.razon_social_anterior || "—"}
                  </p>

                  <p>
                    <strong>Área:</strong>{" "}
                    {movimiento.area_anterior || "—"}
                  </p>

                  <p>
                    <strong>Nave:</strong>{" "}
                    {movimiento.nave_anterior || "—"}
                  </p>

                  <p>
                    <strong>Ubicación:</strong>{" "}
                    {movimiento.ubicacion_anterior || "—"}
                  </p>

                  <p>
                    <strong>Estado:</strong>{" "}
                    {movimiento.estado_anterior || "—"}
                  </p>
                </div>

                <div>
                  <h4>Nuevo</h4>

                  <p>
                    <strong>Usuario:</strong>{" "}
                    {movimiento.usuario_nuevo || "—"}
                  </p>

                  <p>
                    <strong>Razón social:</strong>{" "}
                    {movimiento.razon_social_nueva || "—"}
                  </p>

                  <p>
                    <strong>Área:</strong>{" "}
                    {movimiento.area_nueva || "—"}
                  </p>

                  <p>
                    <strong>Nave:</strong>{" "}
                    {movimiento.nave_nueva || "—"}
                  </p>

                  <p>
                    <strong>Ubicación:</strong>{" "}
                    {movimiento.ubicacion_nueva || "—"}
                  </p>

                  <p>
                    <strong>Estado:</strong>{" "}
                    {movimiento.estado_nuevo || "—"}
                  </p>
                </div>

              </div>

              {movimiento.observaciones && (
                <div className="movimiento-observaciones">
                  <strong>Observaciones:</strong>{" "}
                  {movimiento.observaciones}
                </div>
              )}

            </article>
          ))}

      </main>
    </div>
  );
}

export default HistorialActivo;