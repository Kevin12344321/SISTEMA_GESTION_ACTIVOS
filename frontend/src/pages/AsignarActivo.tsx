import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

type Usuario = {
  id_usuario: number;
  numero_nomina: string;
  nombre: string;
  apellidos: string;
};

type RazonSocial = {
  id_razon_social: number;
  nombre: string;
};

type Area = {
  id_area: number;
  nombre: string;
  id_razon_social: number;
};

type Nave = {
  id_nave: number;
  nombre: string;
};

type Ubicacion = {
  id_ubicacion: number;
  nombre: string;
  id_nave: number | null;
  id_razon_social: number | null;
};

function AsignarActivo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [naves, setNaves] = useState<Nave[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);

  const [idUsuario, setIdUsuario] = useState("");
  const [idRazonSocial, setIdRazonSocial] = useState("");
  const [idArea, setIdArea] = useState("");
  const [idNave, setIdNave] = useState("");
  const [idUbicacion, setIdUbicacion] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // Cargar información inicial
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [
          respuestaUsuarios,
          respuestaRazones,
          respuestaNaves
        ] = await Promise.all([
          api.get("/usuarios", { headers }),
          api.get("/catalogos/razones-sociales", { headers }),
          api.get("/catalogos/naves", { headers })
        ]);

        setUsuarios(respuestaUsuarios.data);
        setRazonesSociales(respuestaRazones.data);
        setNaves(respuestaNaves.data);

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible cargar los datos"
        );
      }
    };

    cargarDatos();
  }, []);

  // Cargar áreas cuando cambia la razón social
  useEffect(() => {
    if (!idRazonSocial) {
      setAreas([]);
      setIdArea("");
      return;
    }

    const cargarAreas = async () => {
      try {
        const respuesta = await api.get(
          `/catalogos/areas?id_razon_social=${idRazonSocial}`,
          { headers }
        );

        setAreas(respuesta.data);
        setIdArea("");

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible cargar las áreas"
        );
      }
    };

    cargarAreas();
  }, [idRazonSocial]);

  // Cargar ubicaciones dependiendo de razón social y nave
  useEffect(() => {
    if (!idRazonSocial || !idNave) {
      setUbicaciones([]);
      setIdUbicacion("");
      return;
    }

    const cargarUbicaciones = async () => {
      try {
        const respuesta = await api.get(
          `/catalogos/ubicaciones?id_nave=${idNave}&id_razon_social=${idRazonSocial}`,
          { headers }
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
  }, [idRazonSocial, idNave]);

  const asignar = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !idUsuario ||
      !idRazonSocial ||
      !idArea ||
      !idNave ||
      !idUbicacion
    ) {
      setMensaje("Completa todos los campos.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await api.put(
        `/activos/${id}/asignar`,
        {
          id_usuario: Number(idUsuario),
          id_razon_social: Number(idRazonSocial),
          id_area: Number(idArea),
          id_nave: Number(idNave),
          id_ubicacion: Number(idUbicacion)
        },
        {
          headers
        }
      );

      navigate(`/activos/${id}`);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible asignar el activo"
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="detalle-page">

      <header className="detalle-header">
        <div>
          <h1>Asignar activo</h1>
          <p>
            Selecciona el responsable y la ubicación del equipo.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate(`/activos/${id}`)}
        >
          Cancelar
        </button>
      </header>

      <main className="form-page-content">

        <form
          className="movimiento-form"
          onSubmit={asignar}
        >

          {mensaje && (
            <div className="page-message">
              {mensaje}
            </div>
          )}

          <div className="form-group">
            <label>Usuario responsable</label>

            <select
              value={idUsuario}
              onChange={(e) =>
                setIdUsuario(e.target.value)
              }
            >
              <option value="">
                Selecciona un usuario
              </option>

              {usuarios.map((usuario) => (
                <option
                  key={usuario.id_usuario}
                  value={usuario.id_usuario}
                >
                  {usuario.numero_nomina} -{" "}
                  {usuario.nombre} {usuario.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Razón social</label>

            <select
              value={idRazonSocial}
              onChange={(e) => {
                setIdRazonSocial(e.target.value);
                setIdNave("");
                setIdUbicacion("");
              }}
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

          <div className="form-group">
            <label>Área</label>

            <select
              value={idArea}
              disabled={!idRazonSocial}
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
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nave</label>

            <select
              value={idNave}
              disabled={!idRazonSocial}
              onChange={(e) =>
                setIdNave(e.target.value)
              }
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
            <label>Ubicación</label>

            <select
              value={idUbicacion}
              disabled={!idRazonSocial || !idNave}
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
                </option>
              ))}
            </select>
          </div>

          <button
            className="primary-action-button"
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? "Asignando..."
              : "Confirmar asignación"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default AsignarActivo;