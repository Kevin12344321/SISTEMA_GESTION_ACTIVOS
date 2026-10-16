import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

type RazonSocial = {
  id_razon_social: number;
  nombre: string;
};

type Area = {
  id_area: number;
  nombre: string;
};

type Nave = {
  id_nave: number;
  nombre: string;
};

type Ubicacion = {
  id_ubicacion: number;
  nombre: string;
};

function RegistrarUsuario() {
  const navigate = useNavigate();

  const [numeroNomina, setNumeroNomina] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [puesto, setPuesto] = useState("");

  const [idRazonSocial, setIdRazonSocial] = useState("");
  const [idArea, setIdArea] = useState("");
  const [idNave, setIdNave] = useState("");
  const [idUbicacion, setIdUbicacion] = useState("");

  const [razonesSociales, setRazonesSociales] =
    useState<RazonSocial[]>([]);

  const [areas, setAreas] = useState<Area[]>([]);
  const [naves, setNaves] = useState<Nave[]>([]);
  const [ubicaciones, setUbicaciones] =
    useState<Ubicacion[]>([]);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [
          respuestaRazones,
          respuestaNaves
        ] = await Promise.all([
          api.get(
            "/catalogos/razones-sociales",
            { headers }
          ),
          api.get(
            "/catalogos/naves",
            { headers }
          )
        ]);

        setRazonesSociales(
          respuestaRazones.data
        );

        setNaves(
          respuestaNaves.data
        );

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible cargar los catálogos"
        );
      }
    };

    cargarCatalogos();
  }, []);

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

  const registrarUsuario = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !numeroNomina.trim() ||
      !nombre.trim() ||
      !apellidos.trim() ||
      !puesto.trim() ||
      !idRazonSocial ||
      !idArea
    ) {
      setMensaje(
        "Nómina, nombre, apellidos, puesto, razón social y área son obligatorios."
      );

      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await api.post(
        "/usuarios",
        {
          numero_nomina:
            numeroNomina.trim(),

          nombre:
            nombre.trim(),

          apellidos:
            apellidos.trim(),

          puesto:
            puesto.trim(),

          id_razon_social:
            Number(idRazonSocial),

          id_area:
            Number(idArea),

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

      window.alert(
        "Usuario registrado correctamente."
      );

      navigate("/usuarios");

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible registrar el usuario"
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="detalle-page">

      <header className="detalle-header">
        <div>
          <h1>Registrar usuario</h1>

          <p>
            Captura los datos del usuario.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/usuarios")
          }
        >
          Cancelar
        </button>
      </header>

      <main className="form-page-content">

        <form
          className="movimiento-form"
          onSubmit={registrarUsuario}
        >

          {mensaje && (
            <div className="page-message">
              {mensaje}
            </div>
          )}

          <div className="form-group">
            <label>Número de nómina</label>

            <input
              type="text"
              value={numeroNomina}
              onChange={(e) =>
                setNumeroNomina(e.target.value)
              }
              placeholder="Ej. 30025"
            />
          </div>

          <div className="form-group">
            <label>Nombre</label>

            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Nombre"
            />
          </div>

          <div className="form-group">
            <label>Apellidos</label>

            <input
              type="text"
              value={apellidos}
              onChange={(e) =>
                setApellidos(e.target.value)
              }
              placeholder="Apellidos"
            />
          </div>

          <div className="form-group">
            <label>Puesto</label>

            <input
              type="text"
              value={puesto}
              onChange={(e) =>
                setPuesto(e.target.value)
              }
              placeholder="Puesto"
            />
          </div>

          <div className="form-group">
            <label>Razón social</label>

            <select
              value={idRazonSocial}
              onChange={(e) => {
                setIdRazonSocial(
                  e.target.value
                );

                setIdArea("");
                setIdNave("");
                setIdUbicacion("");
              }}
            >
              <option value="">
                Selecciona una razón social
              </option>

              {razonesSociales.map(
                (razon) => (
                  <option
                    key={
                      razon.id_razon_social
                    }
                    value={
                      razon.id_razon_social
                    }
                  >
                    {razon.nombre}
                  </option>
                )
              )}

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

          <div className="form-group">
            <label>Ubicación</label>

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

              {ubicaciones.map(
                (ubicacion) => (
                  <option
                    key={
                      ubicacion.id_ubicacion
                    }
                    value={
                      ubicacion.id_ubicacion
                    }
                  >
                    {ubicacion.nombre}
                  </option>
                )
              )}

            </select>
          </div>

          <button
            type="submit"
            className="primary-action-button"
            disabled={cargando}
          >
            {cargando
              ? "Registrando..."
              : "Registrar usuario"}
          </button>

        </form>

      </main>
    </div>
  );
}

export default RegistrarUsuario;