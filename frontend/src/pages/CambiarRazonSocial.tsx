import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

type RazonSocial = {
  id_razon_social: number;
  nombre: string;
};

type Activo = {
  id_activo: number;
  codigo_activo: string;
  razon_social: string | null;
  area: string | null;
  usuario_responsable: string | null;
};

function CambiarRazonSocial() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activo, setActivo] = useState<Activo | null>(null);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [idRazonSocial, setIdRazonSocial] = useState("");

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
          respuestaRazones
        ] = await Promise.all([
          api.get(`/activos/${id}`, {
            headers
          }),

          api.get(
            "/catalogos/razones-sociales",
            {
              headers
            }
          )
        ]);

        setActivo(respuestaActivo.data);
        setRazonesSociales(respuestaRazones.data);

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

  const cambiarRazonSocial = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!idRazonSocial) {
      setMensaje(
        "Selecciona una nueva razón social."
      );
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await api.put(
        `/activos/${id}/cambiar-razon-social`,
        {
          id_razon_social: Number(idRazonSocial)
        },
        {
          headers
        }
      );

      navigate(`/activos/${id}`);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cambiar la razón social"
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
          <h1>Cambiar razón social</h1>

          <p>
            Selecciona la nueva razón social del activo.
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
          onSubmit={cambiarRazonSocial}
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
                <strong>Usuario actual:</strong>{" "}
                {activo.usuario_responsable || "—"}
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
            <label>
              Nueva razón social
            </label>

            <select
              value={idRazonSocial}
              onChange={(e) =>
                setIdRazonSocial(e.target.value)
              }
            >
              <option value="">
                Selecciona una razón social
              </option>

              {razonesSociales.map((razon) => (
                <option
                  key={razon.id_razon_social}
                  value={razon.id_razon_social}
                >
                  {razon.nombre}
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
              : "Confirmar cambio de razón social"}
          </button>

        </form>

      </main>
    </div>
  );
}

export default CambiarRazonSocial;