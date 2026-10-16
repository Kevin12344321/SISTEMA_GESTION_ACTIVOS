import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

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

function DarBajaActivo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activo, setActivo] = useState<Activo | null>(null);
  const [motivoBaja, setMotivoBaja] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    const cargarActivo = async () => {
      try {
        const respuesta = await api.get(
          `/activos/${id}`,
          {
            headers
          }
        );

        setActivo(respuesta.data);

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible cargar el activo"
        );
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarActivo();
  }, [id]);

  const darDeBaja = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!motivoBaja.trim()) {
      setMensaje(
        "El motivo de baja es obligatorio."
      );
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de que deseas dar de baja este activo? Esta acción lo dejará fuera de futuras asignaciones."
    );

    if (!confirmar) {
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await api.put(
        `/activos/${id}/baja`,
        {
          motivo_baja: motivoBaja.trim()
        },
        {
          headers
        }
      );

      window.alert(
        "Activo dado de baja correctamente."
      );

      navigate(`/activos/${id}`);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible dar de baja el activo"
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
          <h1>Dar de baja activo</h1>

          <p>
            Registra el motivo por el que el activo
            dejará de estar disponible.
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
          onSubmit={darDeBaja}
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
                <strong>Tipo:</strong>{" "}
                {activo.tipo_activo}
              </p>

              <p>
                <strong>Marca:</strong>{" "}
                {activo.marca || "—"}
              </p>

              <p>
                <strong>Modelo:</strong>{" "}
                {activo.modelo || "—"}
              </p>

              <p>
                <strong>Estado actual:</strong>{" "}
                {activo.estado}
              </p>

              <p>
                <strong>Usuario actual:</strong>{" "}
                {activo.usuario_responsable || "—"}
              </p>

              <p>
                <strong>Razón social:</strong>{" "}
                {activo.razon_social || "—"}
              </p>

              <p>
                <strong>Área:</strong>{" "}
                {activo.area || "—"}
              </p>

            </div>
          )}

          <div className="form-group">
            <label htmlFor="motivo-baja">
              Motivo de baja
            </label>

            <textarea
              id="motivo-baja"
              value={motivoBaja}
              onChange={(e) =>
                setMotivoBaja(e.target.value)
              }
              placeholder="Escribe el motivo de la baja..."
              rows={5}
            />
          </div>

          <button
            type="submit"
            className="primary-action-button"
            disabled={cargando}
          >
            {cargando
              ? "Procesando..."
              : "Confirmar baja"}
          </button>

        </form>

      </main>
    </div>
  );
}

export default DarBajaActivo;