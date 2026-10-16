import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoEmpresa from "../components/LogoEmpresa";

type TipoActivo = {
  id_tipo_activo: number;
  nombre: string;
};

type RazonSocial = {
  id_razon_social: number;
  nombre: string;
};

type Area = {
  id_area: number;
  nombre: string;
  id_razon_social: number;
  razon_social: string;
};

type Nave = {
  id_nave: number;
  nombre: string;
};

type Ubicacion = {
  id_ubicacion: number;
  nombre: string;
  id_nave: number | null;
  nave: string | null;
  id_razon_social: number | null;
  razon_social: string | null;
};

type Seccion =
  | "tipos"
  | "razones"
  | "areas"
  | "naves"
  | "ubicaciones";

function Catalogos() {
  const navigate = useNavigate();

  const [seccion, setSeccion] =
    useState<Seccion>("tipos");

  const [tiposActivo, setTiposActivo] =
    useState<TipoActivo[]>([]);

  const [razonesSociales, setRazonesSociales] =
    useState<RazonSocial[]>([]);

  const [areas, setAreas] =
    useState<Area[]>([]);

  const [naves, setNaves] =
    useState<Nave[]>([]);

  const [ubicaciones, setUbicaciones] =
    useState<Ubicacion[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  // =========================
  // TIPOS DE ACTIVO
  // =========================

  const [
    mostrarFormularioTipo,
    setMostrarFormularioTipo
  ] = useState(false);

  const [tipoEditando, setTipoEditando] =
    useState<TipoActivo | null>(null);

  const [nombreTipo, setNombreTipo] =
    useState("");

  const [guardandoTipo, setGuardandoTipo] =
    useState(false);

  // =========================
  // RAZONES SOCIALES
  // =========================

  const [
    mostrarFormularioRazon,
    setMostrarFormularioRazon
  ] = useState(false);

  const [razonEditando, setRazonEditando] =
    useState<RazonSocial | null>(null);

  const [nombreRazon, setNombreRazon] =
    useState("");

  const [
    guardandoRazon,
    setGuardandoRazon
  ] = useState(false);

  // =========================
  // ÁREAS
  // =========================

  const [
    mostrarFormularioArea,
    setMostrarFormularioArea
  ] = useState(false);

  const [areaEditando, setAreaEditando] =
    useState<Area | null>(null);

  const [nombreArea, setNombreArea] =
    useState("");

  const [
    idRazonSocialArea,
    setIdRazonSocialArea
  ] = useState("");

  const [
    guardandoArea,
    setGuardandoArea
  ] = useState(false);

  // =========================
  // NAVES
  // =========================

  const [
    mostrarFormularioNave,
    setMostrarFormularioNave
  ] = useState(false);

  const [naveEditando, setNaveEditando] =
    useState<Nave | null>(null);

  const [nombreNave, setNombreNave] =
    useState("");

  const [
    guardandoNave,
    setGuardandoNave
  ] = useState(false);

  // =========================
  // UBICACIONES
  // =========================

  const [
    mostrarFormularioUbicacion,
    setMostrarFormularioUbicacion
  ] = useState(false);

  const [
    ubicacionEditando,
    setUbicacionEditando
  ] = useState<Ubicacion | null>(null);

  const [
    nombreUbicacion,
    setNombreUbicacion
  ] = useState("");

  const [
    idNaveUbicacion,
    setIdNaveUbicacion
  ] = useState("");

  const [
    idRazonSocialUbicacion,
    setIdRazonSocialUbicacion
  ] = useState("");

  const [
    guardandoUbicacion,
    setGuardandoUbicacion
  ] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // =========================
  // CARGAR CATÁLOGOS
  // =========================

  const cargarCatalogos = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const [
        respuestaTipos,
        respuestaRazones,
        respuestaAreas,
        respuestaNaves,
        respuestaUbicaciones
      ] = await Promise.all([
        api.get(
          "/catalogos/tipos-activo",
          { headers }
        ),

        api.get(
          "/catalogos/razones-sociales",
          { headers }
        ),

        api.get(
          "/catalogos/areas",
          { headers }
        ),

        api.get(
          "/catalogos/naves",
          { headers }
        ),

        api.get(
          "/catalogos/ubicaciones",
          { headers }
        )
      ]);

      setTiposActivo(respuestaTipos.data);
      setRazonesSociales(respuestaRazones.data);
      setAreas(respuestaAreas.data);
      setNaves(respuestaNaves.data);
      setUbicaciones(respuestaUbicaciones.data);

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible cargar los catálogos"
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // =========================
  // TIPOS DE ACTIVO
  // =========================

  const abrirNuevoTipo = () => {
    setTipoEditando(null);
    setNombreTipo("");
    setMostrarFormularioTipo(true);
    setMensaje("");
  };

  const abrirEditarTipo = (
    tipo: TipoActivo
  ) => {
    setTipoEditando(tipo);
    setNombreTipo(tipo.nombre);
    setMostrarFormularioTipo(true);
    setMensaje("");
  };

  const cancelarTipo = () => {
    setMostrarFormularioTipo(false);
    setTipoEditando(null);
    setNombreTipo("");
    setMensaje("");
  };

  const guardarTipoActivo = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!nombreTipo.trim()) {
      setMensaje(
        "El nombre del tipo de activo es obligatorio."
      );
      return;
    }

    try {
      setGuardandoTipo(true);
      setMensaje("");

      if (tipoEditando) {
        await api.put(
          `/catalogos/tipos-activo/${tipoEditando.id_tipo_activo}`,
          {
            nombre: nombreTipo.trim()
          },
          {
            headers
          }
        );

        window.alert(
          "Tipo de activo actualizado correctamente."
        );

      } else {
        await api.post(
          "/catalogos/tipos-activo",
          {
            nombre: nombreTipo.trim()
          },
          {
            headers
          }
        );

        window.alert(
          "Tipo de activo registrado correctamente."
        );
      }

      setMostrarFormularioTipo(false);
      setTipoEditando(null);
      setNombreTipo("");

      await cargarCatalogos();

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible guardar el tipo de activo"
      );

    } finally {
      setGuardandoTipo(false);
    }
  };

  // =========================
  // RAZONES SOCIALES
  // =========================

  const abrirNuevaRazon = () => {
    setRazonEditando(null);
    setNombreRazon("");
    setMostrarFormularioRazon(true);
    setMensaje("");
  };

  const abrirEditarRazon = (
    razon: RazonSocial
  ) => {
    setRazonEditando(razon);
    setNombreRazon(razon.nombre);
    setMostrarFormularioRazon(true);
    setMensaje("");
  };

  const cancelarRazon = () => {
    setMostrarFormularioRazon(false);
    setRazonEditando(null);
    setNombreRazon("");
    setMensaje("");
  };

  const guardarRazonSocial = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!nombreRazon.trim()) {
      setMensaje(
        "El nombre de la razón social es obligatorio."
      );
      return;
    }

    try {
      setGuardandoRazon(true);
      setMensaje("");

      if (razonEditando) {
        await api.put(
          `/catalogos/razones-sociales/${razonEditando.id_razon_social}`,
          {
            nombre: nombreRazon.trim()
          },
          {
            headers
          }
        );

        window.alert(
          "Razón social actualizada correctamente."
        );

      } else {
        await api.post(
          "/catalogos/razones-sociales",
          {
            nombre: nombreRazon.trim()
          },
          {
            headers
          }
        );

        window.alert(
          "Razón social registrada correctamente."
        );
      }

      setMostrarFormularioRazon(false);
      setRazonEditando(null);
      setNombreRazon("");

      await cargarCatalogos();

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible guardar la razón social"
      );

    } finally {
      setGuardandoRazon(false);
    }
  };

  // =========================
  // ÁREAS
  // =========================

  const abrirNuevaArea = () => {
    setAreaEditando(null);
    setNombreArea("");
    setIdRazonSocialArea("");
    setMostrarFormularioArea(true);
    setMensaje("");
  };

  const abrirEditarArea = (
    area: Area
  ) => {
    setAreaEditando(area);
    setNombreArea(area.nombre);
    setIdRazonSocialArea(
      String(area.id_razon_social)
    );
    setMostrarFormularioArea(true);
    setMensaje("");
  };

  const cancelarArea = () => {
    setMostrarFormularioArea(false);
    setAreaEditando(null);
    setNombreArea("");
    setIdRazonSocialArea("");
    setMensaje("");
  };

  const guardarArea = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!nombreArea.trim()) {
      setMensaje(
        "El nombre del área es obligatorio."
      );
      return;
    }

    if (!idRazonSocialArea) {
      setMensaje(
        "Selecciona una razón social."
      );
      return;
    }

    try {
      setGuardandoArea(true);
      setMensaje("");

      const datos = {
        nombre: nombreArea.trim(),
        id_razon_social:
          Number(idRazonSocialArea)
      };

      if (areaEditando) {
        await api.put(
          `/catalogos/areas/${areaEditando.id_area}`,
          datos,
          {
            headers
          }
        );

        window.alert(
          "Área actualizada correctamente."
        );

      } else {
        await api.post(
          "/catalogos/areas",
          datos,
          {
            headers
          }
        );

        window.alert(
          "Área registrada correctamente."
        );
      }

      setMostrarFormularioArea(false);
      setAreaEditando(null);
      setNombreArea("");
      setIdRazonSocialArea("");

      await cargarCatalogos();

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible guardar el área"
      );

    } finally {
      setGuardandoArea(false);
    }
  };

  // =========================
  // NAVES
  // =========================

  const abrirNuevaNave = () => {
    setNaveEditando(null);
    setNombreNave("");
    setMostrarFormularioNave(true);
    setMensaje("");
  };

  const abrirEditarNave = (
    nave: Nave
  ) => {
    setNaveEditando(nave);
    setNombreNave(nave.nombre);
    setMostrarFormularioNave(true);
    setMensaje("");
  };

  const cancelarNave = () => {
    setMostrarFormularioNave(false);
    setNaveEditando(null);
    setNombreNave("");
    setMensaje("");
  };

  const guardarNave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!nombreNave.trim()) {
      setMensaje(
        "El nombre de la nave es obligatorio."
      );
      return;
    }

    try {
      setGuardandoNave(true);
      setMensaje("");

      if (naveEditando) {
        await api.put(
          `/catalogos/naves/${naveEditando.id_nave}`,
          {
            nombre: nombreNave.trim()
          },
          {
            headers
          }
        );

        window.alert(
          "Nave actualizada correctamente."
        );

      } else {
        await api.post(
          "/catalogos/naves",
          {
            nombre: nombreNave.trim()
          },
          {
            headers
          }
        );

        window.alert(
          "Nave registrada correctamente."
        );
      }

      setMostrarFormularioNave(false);
      setNaveEditando(null);
      setNombreNave("");

      await cargarCatalogos();

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible guardar la nave"
      );

    } finally {
      setGuardandoNave(false);
    }
  };

  // =========================
  // UBICACIONES
  // =========================

  const abrirNuevaUbicacion = () => {
    setUbicacionEditando(null);
    setNombreUbicacion("");
    setIdNaveUbicacion("");
    setIdRazonSocialUbicacion("");
    setMostrarFormularioUbicacion(true);
    setMensaje("");
  };

  const abrirEditarUbicacion = (
    ubicacion: Ubicacion
  ) => {
    setUbicacionEditando(ubicacion);
    setNombreUbicacion(ubicacion.nombre);

    setIdNaveUbicacion(
      ubicacion.id_nave
        ? String(ubicacion.id_nave)
        : ""
    );

    setIdRazonSocialUbicacion(
      ubicacion.id_razon_social
        ? String(ubicacion.id_razon_social)
        : ""
    );

    setMostrarFormularioUbicacion(true);
    setMensaje("");
  };

  const cancelarUbicacion = () => {
    setMostrarFormularioUbicacion(false);
    setUbicacionEditando(null);
    setNombreUbicacion("");
    setIdNaveUbicacion("");
    setIdRazonSocialUbicacion("");
    setMensaje("");
  };

  const guardarUbicacion = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!nombreUbicacion.trim()) {
      setMensaje(
        "El nombre de la ubicación es obligatorio."
      );
      return;
    }

    if (
      !idNaveUbicacion &&
      !idRazonSocialUbicacion
    ) {
      setMensaje(
        "Selecciona una nave, una razón social o ambas."
      );
      return;
    }

    try {
      setGuardandoUbicacion(true);
      setMensaje("");

      const datos = {
        nombre: nombreUbicacion.trim(),

        id_nave:
          idNaveUbicacion
            ? Number(idNaveUbicacion)
            : null,

        id_razon_social:
          idRazonSocialUbicacion
            ? Number(idRazonSocialUbicacion)
            : null
      };

      if (ubicacionEditando) {
        await api.put(
          `/catalogos/ubicaciones/${ubicacionEditando.id_ubicacion}`,
          datos,
          {
            headers
          }
        );

        window.alert(
          "Ubicación actualizada correctamente."
        );

      } else {
        await api.post(
          "/catalogos/ubicaciones",
          datos,
          {
            headers
          }
        );

        window.alert(
          "Ubicación registrada correctamente."
        );
      }

      setMostrarFormularioUbicacion(false);
      setUbicacionEditando(null);
      setNombreUbicacion("");
      setIdNaveUbicacion("");
      setIdRazonSocialUbicacion("");

      await cargarCatalogos();

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible guardar la ubicación"
      );

    } finally {
      setGuardandoUbicacion(false);
    }
  };

  return (
    <div className="activos-page">

      <header className="activos-header">

  <div>
    <LogoEmpresa />

    <div style={{ marginTop: "12px" }}>
      <h1>Catálogos</h1>

      <p>
        Administra la información utilizada
        por el sistema.
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

        <div className="catalogos-tabs">

          <button
            className={
              seccion === "tipos"
                ? "catalogo-tab activo"
                : "catalogo-tab"
            }
            onClick={() => setSeccion("tipos")}
          >
            Tipos de activo
          </button>

          <button
            className={
              seccion === "razones"
                ? "catalogo-tab activo"
                : "catalogo-tab"
            }
            onClick={() => setSeccion("razones")}
          >
            Razones sociales
          </button>

          <button
            className={
              seccion === "areas"
                ? "catalogo-tab activo"
                : "catalogo-tab"
            }
            onClick={() => setSeccion("areas")}
          >
            Áreas
          </button>

          <button
            className={
              seccion === "naves"
                ? "catalogo-tab activo"
                : "catalogo-tab"
            }
            onClick={() => setSeccion("naves")}
          >
            Naves
          </button>

          <button
            className={
              seccion === "ubicaciones"
                ? "catalogo-tab activo"
                : "catalogo-tab"
            }
            onClick={() => setSeccion("ubicaciones")}
          >
            Ubicaciones
          </button>

        </div>

        {cargando ? (
          <p>Cargando catálogos...</p>
        ) : (
          <>

            {seccion === "tipos" && (
              <div className="table-container">

                <div className="catalogo-section-header">
                  <h2>Tipos de activo</h2>

                  <button
                    className="primary-action-button"
                    style={{
                      width: "auto",
                      margin: 0
                    }}
                    onClick={abrirNuevoTipo}
                  >
                    + Nuevo tipo
                  </button>
                </div>

                {mostrarFormularioTipo && (
                  <form
                    className="catalogo-inline-form"
                    onSubmit={guardarTipoActivo}
                  >
                    <div className="form-group">
                      <label>
                        Nombre del tipo de activo
                      </label>

                      <input
                        type="text"
                        value={nombreTipo}
                        onChange={(e) =>
                          setNombreTipo(e.target.value)
                        }
                        placeholder="Ej. Monitor"
                      />
                    </div>

                    <div className="catalogo-form-actions">
                      <button
                        type="submit"
                        className="primary-action-button"
                        style={{
                          width: "auto",
                          margin: 0
                        }}
                        disabled={guardandoTipo}
                      >
                        {guardandoTipo
                          ? "Guardando..."
                          : tipoEditando
                            ? "Guardar cambios"
                            : "Registrar tipo"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelarTipo}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <table className="activos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tiposActivo.length === 0 ? (
                      <tr>
                        <td colSpan={3}>
                          No hay tipos de activo registrados.
                        </td>
                      </tr>
                    ) : (
                      tiposActivo.map((tipo) => (
                        <tr key={tipo.id_tipo_activo}>
                          <td>
                            {tipo.id_tipo_activo}
                          </td>

                          <td>
                            {tipo.nombre}
                          </td>

                          <td>
                            <button
                              className="table-button"
                              onClick={() =>
                                abrirEditarTipo(tipo)
                              }
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>
            )}

            {seccion === "razones" && (
              <div className="table-container">

                <div className="catalogo-section-header">
                  <h2>Razones sociales</h2>

                  <button
                    className="primary-action-button"
                    style={{
                      width: "auto",
                      margin: 0
                    }}
                    onClick={abrirNuevaRazon}
                  >
                    + Nueva razón social
                  </button>
                </div>

                {mostrarFormularioRazon && (
                  <form
                    className="catalogo-inline-form"
                    onSubmit={guardarRazonSocial}
                  >
                    <div className="form-group">
                      <label>
                        Nombre de la razón social
                      </label>

                      <input
                        type="text"
                        value={nombreRazon}
                        onChange={(e) =>
                          setNombreRazon(e.target.value)
                        }
                        placeholder="Ej. Nueva empresa"
                      />
                    </div>

                    <div className="catalogo-form-actions">
                      <button
                        type="submit"
                        className="primary-action-button"
                        style={{
                          width: "auto",
                          margin: 0
                        }}
                        disabled={guardandoRazon}
                      >
                        {guardandoRazon
                          ? "Guardando..."
                          : razonEditando
                            ? "Guardar cambios"
                            : "Registrar razón social"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelarRazon}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <table className="activos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {razonesSociales.length === 0 ? (
                      <tr>
                        <td colSpan={3}>
                          No hay razones sociales registradas.
                        </td>
                      </tr>
                    ) : (
                      razonesSociales.map((razon) => (
                        <tr key={razon.id_razon_social}>
                          <td>
                            {razon.id_razon_social}
                          </td>

                          <td>
                            {razon.nombre}
                          </td>

                          <td>
                            <button
                              className="table-button"
                              onClick={() =>
                                abrirEditarRazon(razon)
                              }
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>
            )}

            {seccion === "areas" && (
              <div className="table-container">

                <div className="catalogo-section-header">
                  <h2>Áreas</h2>

                  <button
                    className="primary-action-button"
                    style={{
                      width: "auto",
                      margin: 0
                    }}
                    onClick={abrirNuevaArea}
                  >
                    + Nueva área
                  </button>
                </div>

                {mostrarFormularioArea && (
                  <form
                    className="catalogo-inline-form"
                    onSubmit={guardarArea}
                  >
                    <div className="form-group">
                      <label>
                        Nombre del área
                      </label>

                      <input
                        type="text"
                        value={nombreArea}
                        onChange={(e) =>
                          setNombreArea(e.target.value)
                        }
                        placeholder="Ej. Recursos Humanos"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Razón social
                      </label>

                      <select
                        value={idRazonSocialArea}
                        onChange={(e) =>
                          setIdRazonSocialArea(
                            e.target.value
                          )
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

                    <div className="catalogo-form-actions">
                      <button
                        type="submit"
                        className="primary-action-button"
                        style={{
                          width: "auto",
                          margin: 0
                        }}
                        disabled={guardandoArea}
                      >
                        {guardandoArea
                          ? "Guardando..."
                          : areaEditando
                            ? "Guardar cambios"
                            : "Registrar área"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelarArea}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <table className="activos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Área</th>
                      <th>Razón social</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {areas.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          No hay áreas registradas.
                        </td>
                      </tr>
                    ) : (
                      areas.map((area) => (
                        <tr key={area.id_area}>
                          <td>
                            {area.id_area}
                          </td>

                          <td>
                            {area.nombre}
                          </td>

                          <td>
                            {area.razon_social}
                          </td>

                          <td>
                            <button
                              className="table-button"
                              onClick={() =>
                                abrirEditarArea(area)
                              }
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>
            )}

            {seccion === "naves" && (
              <div className="table-container">

                <div className="catalogo-section-header">
                  <h2>Naves</h2>

                  <button
                    className="primary-action-button"
                    style={{
                      width: "auto",
                      margin: 0
                    }}
                    onClick={abrirNuevaNave}
                  >
                    + Nueva nave
                  </button>
                </div>

                {mostrarFormularioNave && (
                  <form
                    className="catalogo-inline-form"
                    onSubmit={guardarNave}
                  >
                    <div className="form-group">
                      <label>
                        Nombre de la nave
                      </label>

                      <input
                        type="text"
                        value={nombreNave}
                        onChange={(e) =>
                          setNombreNave(e.target.value)
                        }
                        placeholder="Ej. Nave 2"
                      />
                    </div>

                    <div className="catalogo-form-actions">
                      <button
                        type="submit"
                        className="primary-action-button"
                        style={{
                          width: "auto",
                          margin: 0
                        }}
                        disabled={guardandoNave}
                      >
                        {guardandoNave
                          ? "Guardando..."
                          : naveEditando
                            ? "Guardar cambios"
                            : "Registrar nave"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelarNave}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <table className="activos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {naves.length === 0 ? (
                      <tr>
                        <td colSpan={3}>
                          No hay naves registradas.
                        </td>
                      </tr>
                    ) : (
                      naves.map((nave) => (
                        <tr key={nave.id_nave}>
                          <td>
                            {nave.id_nave}
                          </td>

                          <td>
                            {nave.nombre}
                          </td>

                          <td>
                            <button
                              className="table-button"
                              onClick={() =>
                                abrirEditarNave(nave)
                              }
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>
            )}

            {seccion === "ubicaciones" && (
              <div className="table-container">

                <div className="catalogo-section-header">
                  <h2>Ubicaciones</h2>

                  <button
                    className="primary-action-button"
                    style={{
                      width: "auto",
                      margin: 0
                    }}
                    onClick={abrirNuevaUbicacion}
                  >
                    + Nueva ubicación
                  </button>
                </div>

                {mostrarFormularioUbicacion && (
                  <form
                    className="catalogo-inline-form"
                    onSubmit={guardarUbicacion}
                  >
                    <div className="form-group">
                      <label>
                        Nombre de la ubicación
                      </label>

                      <input
                        type="text"
                        value={nombreUbicacion}
                        onChange={(e) =>
                          setNombreUbicacion(
                            e.target.value
                          )
                        }
                        placeholder="Ej. Oficina Administrativa"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Nave
                      </label>

                      <select
                        value={idNaveUbicacion}
                        onChange={(e) =>
                          setIdNaveUbicacion(
                            e.target.value
                          )
                        }
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
                      <label>
                        Razón social
                      </label>

                      <select
                        value={idRazonSocialUbicacion}
                        onChange={(e) =>
                          setIdRazonSocialUbicacion(
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Sin razón social
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

                    <div className="catalogo-form-actions">
                      <button
                        type="submit"
                        className="primary-action-button"
                        style={{
                          width: "auto",
                          margin: 0
                        }}
                        disabled={guardandoUbicacion}
                      >
                        {guardandoUbicacion
                          ? "Guardando..."
                          : ubicacionEditando
                            ? "Guardar cambios"
                            : "Registrar ubicación"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelarUbicacion}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <table className="activos-table">

                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ubicación</th>
                      <th>Nave</th>
                      <th>Razón social</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ubicaciones.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          No hay ubicaciones registradas.
                        </td>
                      </tr>
                    ) : (
                      ubicaciones.map((ubicacion) => (
                        <tr key={ubicacion.id_ubicacion}>
                          <td>
                            {ubicacion.id_ubicacion}
                          </td>

                          <td>
                            {ubicacion.nombre}
                          </td>

                          <td>
                            {ubicacion.nave || "—"}
                          </td>

                          <td>
                            {ubicacion.razon_social || "—"}
                          </td>

                          <td>
                            <button
                              className="table-button"
                              onClick={() =>
                                abrirEditarUbicacion(
                                  ubicacion
                                )
                              }
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                </table>

              </div>
            )}

          </>
        )}

      </main>

    </div>
  );
}

export default Catalogos;