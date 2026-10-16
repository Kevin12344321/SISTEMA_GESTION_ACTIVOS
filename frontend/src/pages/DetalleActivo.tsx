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

  numero_serie_mouse: string | null;
  numero_serie_teclado: string | null;
  numero_serie_diadema: string | null;
  numero_serie_cargador: string | null;
  licenciamientos: string | null;

  estado: string;
  usuario_responsable: string | null;
  razon_social: string | null;
  area: string | null;
  nave: string | null;
  ubicacion: string | null;
  fecha_asignacion: string | null;
  fecha_baja: string | null;
  motivo_baja: string | null;
};

function ActivoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activo, setActivo] =
    useState<Activo | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const usuarioGuardado =
    localStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  useEffect(() => {
    const cargarActivo = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const respuesta = await api.get(
          `/activos/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setActivo(respuesta.data);

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible consultar el activo"
        );

      } finally {
        setCargando(false);
      }
    };

    cargarActivo();
  }, [id]);

  if (cargando) {
    return (
      <p className="detalle-cargando">
        Cargando activo...
      </p>
    );
  }

  if (mensaje || !activo) {
    return (
      <div className="detalle-cargando">

        <p>
          {mensaje || "Activo no encontrado"}
        </p>

        <button
          onClick={() =>
            navigate("/activos")
          }
        >
          Volver
        </button>

      </div>
    );
  }

  const nombreTipo =
    activo.tipo_activo
      ?.trim()
      .toLowerCase() || "";

  const esEquipoComputo =
    nombreTipo === "pc" ||
    nombreTipo === "laptop" ||
    nombreTipo.includes(
      "computadora portátil"
    ) ||
    nombreTipo.includes(
      "computadora portatil"
    ) ||
    nombreTipo.includes(
      "computadora de escritorio"
    );

  return (
    <div className="detalle-page">

      <header className="detalle-header">

        <div>
          <h1>
            {activo.codigo_activo}
          </h1>

          <p>
            Detalle del activo
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/activos")
          }
        >
          Volver
        </button>

      </header>

      <main className="detalle-content">

        <section className="detalle-card">

          <div className="detalle-grid">

            <div>
              <span>
                Tipo de activo
              </span>

              <strong>
                {activo.tipo_activo}
              </strong>
            </div>

            <div>
              <span>
                Marca
              </span>

              <strong>
                {activo.marca || "—"}
              </strong>
            </div>

            <div>
              <span>
                Modelo
              </span>

              <strong>
                {activo.modelo || "—"}
              </strong>
            </div>

            <div>
              <span>
                Número de serie
              </span>

              <strong>
                {activo.numero_serie || "—"}
              </strong>
            </div>

            <div>
              <span>
                Estado
              </span>

              <strong>
                {activo.estado}
              </strong>
            </div>

            <div>
              <span>
                Usuario responsable
              </span>

              <strong>
                {
                  activo.usuario_responsable ||
                  "—"
                }
              </strong>
            </div>

            <div>
              <span>
                Razón social
              </span>

              <strong>
                {
                  activo.razon_social ||
                  "—"
                }
              </strong>
            </div>

            <div>
              <span>
                Área
              </span>

              <strong>
                {activo.area || "—"}
              </strong>
            </div>

            <div>
              <span>
                Nave
              </span>

              <strong>
                {activo.nave || "—"}
              </strong>
            </div>

            <div>
              <span>
                Ubicación
              </span>

              <strong>
                {activo.ubicacion || "—"}
              </strong>
            </div>

            <div>
              <span>
                Fecha de asignación
              </span>

              <strong>
                {activo.fecha_asignacion
                  ? new Date(
                      activo.fecha_asignacion
                    ).toLocaleString()
                  : "—"}
              </strong>
            </div>

            <div>
              <span>
                Fecha de baja
              </span>

              <strong>
                {activo.fecha_baja
                  ? new Date(
                      activo.fecha_baja
                    ).toLocaleString()
                  : "—"}
              </strong>
            </div>

          </div>

          {/* =========================
              ACCESORIOS Y LICENCIAS
              SOLO PC / LAPTOP
          ========================= */}

          {esEquipoComputo && (
            <div className="detalle-equipo-extra">

              <h2>
                Accesorios y licenciamientos
              </h2>

              <div className="detalle-grid">

                <div>
                  <span>
                    Mouse
                  </span>

                  <strong>
                    {
                      activo.numero_serie_mouse ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Teclado
                  </span>

                  <strong>
                    {
                      activo.numero_serie_teclado ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Diadema
                  </span>

                  <strong>
                    {
                      activo.numero_serie_diadema ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Cargador
                  </span>

                  <strong>
                    {
                      activo.numero_serie_cargador ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Licenciamientos
                  </span>

                  <strong>
                    {
                      activo.licenciamientos ||
                      "—"
                    }
                  </strong>
                </div>

              </div>

            </div>
          )}

          {activo.motivo_baja && (
            <div className="motivo-baja">

              <span>
                Motivo de baja
              </span>

              <strong>
                {activo.motivo_baja}
              </strong>

            </div>
          )}

        </section>

        {usuario?.rol === "Administrador" && (
          <section className="acciones-card">

            <h2>
              Acciones
            </h2>

            <div className="acciones-grid">

              {activo.estado === "En almacén" && (
                <button
                  onClick={() =>
                    navigate(
                      `/activos/${activo.id_activo}/asignar`
                    )
                  }
                >
                  Asignar activo
                </button>
              )}

              {activo.estado === "En uso" && (
                <>

                  <button
                    onClick={() =>
                      navigate(
                        `/activos/${activo.id_activo}/cambiar-usuario`
                      )
                    }
                  >
                    Cambiar usuario
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/activos/${activo.id_activo}/cambiar-area`
                      )
                    }
                  >
                    Cambiar área
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/activos/${activo.id_activo}/cambiar-razon-social`
                      )
                    }
                  >
                    Cambiar razón social
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/activos/${activo.id_activo}/cambiar-ubicacion`
                      )
                    }
                  >
                    Cambiar ubicación
                  </button>

                  <button
                    onClick={async () => {
                      const confirmar =
                        window.confirm(
                          "¿Estás seguro de que deseas devolver este activo al almacén?"
                        );

                      if (!confirmar) {
                        return;
                      }

                      try {
                        const token =
                          localStorage.getItem(
                            "token"
                          );

                        await api.put(
                          `/activos/${activo.id_activo}/devolver`,
                          {},
                          {
                            headers: {
                              Authorization:
                                `Bearer ${token}`
                            }
                          }
                        );

                        window.alert(
                          "Activo devuelto al almacén correctamente."
                        );

                        window.location.reload();

                      } catch (error: any) {
                        window.alert(
                          error.response?.data
                            ?.mensaje ||
                          "No fue posible devolver el activo al almacén."
                        );
                      }
                    }}
                  >
                    Devolver al almacén
                  </button>

                </>
              )}

              {activo.estado !== "Baja" && (
                <button
                  onClick={() =>
                    navigate(
                      `/activos/${activo.id_activo}/baja`
                    )
                  }
                >
                  Dar de baja
                </button>
              )}

              <button
                onClick={() =>
                  navigate(
                    `/historial/activo/${activo.id_activo}`
                  )
                }
              >
                Ver historial
              </button>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default ActivoDetalle;