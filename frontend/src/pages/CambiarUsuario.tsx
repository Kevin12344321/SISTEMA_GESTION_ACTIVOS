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

function CambiarUsuario() {
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

  // Cargar usuarios, razones sociales y naves
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

  // Cargar áreas de la razón social seleccionada
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
          {
            headers
          }
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

  // Cargar ubicaciones según razón social y nave
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
  }, [idRazonSocial, idNave]);

  const cambiarUsuario = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !idUsuario ||
      !idRazonSocial ||
      !idArea
    ) {
      setMensaje(
        "Usuario, razón social y área son obligatorios."
      );

      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await api.put(
        `/activos/${id}/cambiar-usuario`,
        {
          id_usuario: Number(idUsuario),
          id_razon_social: Number(idRazonSocial),
          id_area: Number(idArea),

          id_nave:
            idNave
              ? Number(idNave)
              : null,

          id_ubicacion:
            idUbicacion
              ? Number(idUbicacion)
              : null
        },
        {
          headers
        }
      );

      navigate(`/activos/${id}`);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cambiar el usuario"
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="detalle-page">

      <header className="detalle-header">
        <div>
          <h1>Cambiar usuario</h1>

          <p>
            Selecciona el nuevo responsable y los datos
            de asignación del activo.
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
          onSubmit={cambiarUsuario}
        >

          {mensaje && (
            <div className="page-message">
              {mensaje}
            </div>
          )}

          {/* USUARIO */}
          <div className="form-group">

            <label>
              Nuevo usuario responsable
            </label>

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
                  {usuario.numero_nomina}
                  {" - "}
                  {usuario.nombre}
                  {" "}
                  {usuario.apellidos}
                </option>
              ))}

            </select>

          </div>

          {/* RAZÓN SOCIAL */}
          <div className="form-group">

            <label>
              Razón social
            </label>

            <select
              value={idRazonSocial}
              onChange={(e) => {
                setIdRazonSocial(e.target.value);
                setIdArea("");
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

          {/* ÁREA */}
          <div className="form-group">

            <label>
              Área
            </label>

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

          {/* NAVE */}
          <div className="form-group">

            <label>
              Nave
            </label>

            <select
              value={idNave}
              disabled={!idRazonSocial}
              onChange={(e) => {
                setIdNave(e.target.value);
                setIdUbicacion("");
              }}
            >
              <option value="">
                Sin nave
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

          {/* UBICACIÓN */}
          <div className="form-group">

            <label>
              Ubicación
            </label>

            <select
              value={idUbicacion}
              disabled={
                !idRazonSocial ||
                !idNave
              }
              onChange={(e) =>
                setIdUbicacion(e.target.value)
              }
            >
              <option value="">
                Sin ubicación
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
            type="submit"
            className="primary-action-button"
            disabled={cargando}
          >
            {cargando
              ? "Guardando..."
              : "Confirmar cambio de usuario"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default CambiarUsuario;