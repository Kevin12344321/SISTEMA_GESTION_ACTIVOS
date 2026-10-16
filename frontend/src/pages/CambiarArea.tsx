import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

type Area = {
  id_area: number;
  nombre: string;
  id_razon_social: number;
  razon_social?: string;
};

type Activo = {
  id_activo: number;
  codigo_activo: string;
  id_razon_social?: number;
  razon_social: string | null;
  area: string | null;
};

function CambiarArea() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activo, setActivo] = useState<Activo | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [idArea, setIdArea] = useState("");

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

        const respuestaActivo = await api.get(
          `/activos/${id}`,
          {
            headers
          }
        );

        const activoObtenido = respuestaActivo.data;

        setActivo(activoObtenido);

        const respuestaAreas = await api.get(
          "/catalogos/areas",
          {
            headers
          }
        );

        setAreas(respuestaAreas.data);

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

  const cambiarArea = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!idArea) {
      setMensaje("Selecciona una nueva área.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await api.put(
        `/activos/${id}/cambiar-area`,
        {
          id_area: Number(idArea)
        },
        {
          headers
        }
      );

      navigate(`/activos/${id}`);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cambiar el área"
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
          <h1>Cambiar área</h1>

          <p>
            Selecciona la nueva área del activo.
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
          onSubmit={cambiarArea}
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
                <strong>Razón social actual:</strong>{" "}
                {activo.razon_social || "—"}
              </p>

              <p>
                <strong>Área actual:</strong>{" "}
                {activo.area || "—"}
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Nueva área</label>

            <select
              value={idArea}
              onChange={(e) =>
                setIdArea(e.target.value)
              }
            >
              <option value="">
                Selecciona un área
              </option>

              {areas.map((area) => (
                <option
                  key={area.id_area}
                  value={area.id_area}
                >
                  {area.nombre}
                  {area.razon_social
                    ? ` - ${area.razon_social}`
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
              : "Confirmar cambio de área"}
          </button>

        </form>

      </main>
    </div>
  );
}

export default CambiarArea;