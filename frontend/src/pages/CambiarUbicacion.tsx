import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

type Nave = {
  id_nave: number;
  nombre: string;
};

type Ubicacion = {
  id_ubicacion: number;
  nombre: string;
  id_nave: number | null;
  id_razon_social: number | null;
  nave?: string | null;
  razon_social?: string | null;
};

type Activo = {
  id_activo: number;
  codigo_activo: string;
  razon_social: string | null;
  area: string | null;
  nave: string | null;
  ubicacion: string | null;
};

function CambiarUbicacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activo, setActivo] = useState<Activo | null>(null);
  const [naves, setNaves] = useState<Nave[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);

  const [idNave, setIdNave] = useState("");
  const [idUbicacion, setIdUbicacion] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setMensaje("");

        const [
          respuestaActivo,
          respuestaNaves
        ] = await Promise.all([
          api.get(`/activos/${id}`, {
            headers
          }),

          api.get("/catalogos/naves", {
            headers
          })
        ]);

        setActivo(respuestaActivo.data);
        setNaves(respuestaNaves.data);

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible cargar la información"
        );
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, [id]);

  useEffect(() => {
    if (!idNave) {
      setUbicaciones([]);
      setIdUbicacion("");
      return;
    }

    const cargarUbicaciones = async () => {
      try {
        setMensaje("");

        const respuesta = await api.get(
          `/catalogos/ubicaciones?id_nave=${idNave}`,
          {
            headers
          }
        );

        setUbicaciones(respuesta.data);
        setIdUbicacion("");

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible cargar las ubicaciones"
        );
      }
    };

    cargarUbicaciones();
  }, [idNave]);

  const cambiarUbicacion = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!idUbicacion) {
      setMensaje(
        "Selecciona una nueva ubicación."
      );
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await api.put(
        `/activos/${id}/cambiar-ubicacion`,
        {
          id_nave:
            idNave
              ? Number(idNave)
              : null,

          id_ubicacion:
            Number(idUbicacion)
        },
        {
          headers
        }
      );

      navigate(`/activos/${id}`);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cambiar la ubicación"
      );

    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <p className="detalle-cargando">
        Cargando información...
      </p>
    );
  }

  return (
    <div className="detalle-page">

      <header className="detalle-header">
        <div>
          <h1>Cambiar ubicación</h1>

          <p>
            Selecciona la nueva nave y ubicación del activo.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate(`/activos/${id}`)
          }
        >
          Cancelar
        </button>
      </header>

      <main className="form-page-content">

        <form
          className="movimiento-form"
          onSubmit={cambiarUbicacion}
        >

          {mensaje && (
            <div className="page-message">
              {mensaje}
            </div>
          )}

          {activo && (
            <div className="form-info-box">

              <p>
                <strong>Activo:</strong>{" "}
                {activo.codigo_activo}
              </p>

              <p>
                <strong>Razón social:</strong>{" "}
                {activo.razon_social || "—"}
              </p>

              <p>
                <strong>Área:</strong>{" "}
                {activo.area || "—"}
              </p>

              <p>
                <strong>Nave actual:</strong>{" "}
                {activo.nave || "—"}
              </p>

              <p>
                <strong>Ubicación actual:</strong>{" "}
                {activo.ubicacion || "—"}
              </p>

            </div>
          )}

          <div className="form-group">
            <label>
              Nueva nave
            </label>

            <select
              value={idNave}
              onChange={(e) => {
                setIdNave(e.target.value);
                setIdUbicacion("");
              }}
            >
              <option value="">
                Selecciona una nave
              </option>

              {naves.map((nave) => (
                <option
                  key={nave.id_nave}
                  value={nave.id_nave}
                >
                  {nave.nombre}
                </option>
              ))}

            </select>
          </div>

          <div className="form-group">
            <label>
              Nueva ubicación
            </label>

            <select
              value={idUbicacion}
              disabled={!idNave}
              onChange={(e) =>
                setIdUbicacion(e.target.value)
              }
            >
              <option value="">
                Selecciona una ubicación
              </option>

              {ubicaciones.map((ubicacion) => (
                <option
                  key={ubicacion.id_ubicacion}
                  value={ubicacion.id_ubicacion}
                >
                  {ubicacion.nombre}
                  {ubicacion.razon_social
                    ? ` - ${ubicacion.razon_social}`
                    : ""}
                </option>
              ))}

            </select>
          </div>

          <button
            type="submit"
            className="primary-action-button"
            disabled={cargando}
          >
            {cargando
              ? "Guardando..."
              : "Confirmar cambio de ubicación"}
          </button>

        </form>

      </main>
    </div>
  );
}

export default CambiarUbicacion;