import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

type TipoActivo = {
  id_tipo_activo: number;
  nombre: string;
};

function RegistrarActivo() {
  const navigate = useNavigate();

  const [tiposActivo, setTiposActivo] =
    useState<TipoActivo[]>([]);

  const [idTipoActivo, setIdTipoActivo] =
    useState("");

  const [marca, setMarca] =
    useState("");

  const [modelo, setModelo] =
    useState("");

  const [numeroSerie, setNumeroSerie] =
    useState("");

  // =====================================================
  // DATOS ADICIONALES PARA PC Y LAPTOP
  // =====================================================

  const [numeroSerieMouse, setNumeroSerieMouse] =
    useState("");

  const [numeroSerieTeclado, setNumeroSerieTeclado] =
    useState("");

  const [numeroSerieDiadema, setNumeroSerieDiadema] =
    useState("");

  const [numeroSerieCargador, setNumeroSerieCargador] =
    useState("");

  const [licenciamientos, setLicenciamientos] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // =====================================================
  // OBTENER TIPO DE ACTIVO SELECCIONADO
  // =====================================================

  const tipoSeleccionado = tiposActivo.find(
    (tipo) =>
      String(tipo.id_tipo_activo) === idTipoActivo
  );

  const nombreTipo =
    tipoSeleccionado?.nombre
      ?.trim()
      .toLowerCase() || "";

  /*
    Permitimos diferentes nombres por si en el catálogo
    aparece como:
    - PC
    - Laptop
    - Computadora portátil
    - Computadora de escritorio
  */

  const esEquipoComputo =
    nombreTipo === "pc" ||
    nombreTipo === "laptop" ||
    nombreTipo.includes("computadora portátil") ||
    nombreTipo.includes("computadora portatil") ||
    nombreTipo.includes("computadora de escritorio");

  // =====================================================
  // CARGAR TIPOS DE ACTIVO
  // =====================================================

  useEffect(() => {
    const cargarTiposActivo = async () => {
      try {
        const respuesta = await api.get(
          "/catalogos/tipos-activo",
          {
            headers
          }
        );

        setTiposActivo(respuesta.data);

      } catch (error: any) {
        setMensaje(
          error.response?.data?.mensaje ||
          "No fue posible cargar los tipos de activo"
        );
      }
    };

    cargarTiposActivo();
  }, []);

  // =====================================================
  // REGISTRAR ACTIVO
  // =====================================================

  const registrarActivo = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!idTipoActivo) {
      setMensaje(
        "Selecciona un tipo de activo."
      );

      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const respuesta = await api.post(
        "/activos",
        {
          id_tipo_activo:
            Number(idTipoActivo),

          marca:
            marca.trim() || null,

          modelo:
            modelo.trim() || null,

          numero_serie:
            numeroSerie.trim() || null,

          // Solo se guardan para PC o Laptop
          numero_serie_mouse:
            esEquipoComputo
              ? numeroSerieMouse.trim() || null
              : null,

          numero_serie_teclado:
            esEquipoComputo
              ? numeroSerieTeclado.trim() || null
              : null,

          numero_serie_diadema:
            esEquipoComputo
              ? numeroSerieDiadema.trim() || null
              : null,

          numero_serie_cargador:
            esEquipoComputo
              ? numeroSerieCargador.trim() || null
              : null,

          licenciamientos:
            esEquipoComputo
              ? licenciamientos.trim() || null
              : null
        },
        {
          headers
        }
      );

      window.alert(
        respuesta.data?.mensaje ||
        "Activo registrado correctamente"
      );

      navigate("/activos");

    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
        "No fue posible registrar el activo"
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="detalle-page">

      <header className="detalle-header">

        <div>
          <h1>
            Registrar activo
          </h1>

          <p>
            Captura la información del nuevo activo.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/activos")
          }
        >
          Cancelar
        </button>

      </header>

      <main className="form-page-content">

        <form
          className="movimiento-form"
          onSubmit={registrarActivo}
        >

          {mensaje && (
            <div className="page-message">
              {mensaje}
            </div>
          )}

          {/* =========================
              INFORMACIÓN GENERAL
          ========================= */}

          <div className="form-group">

            <label>
              Tipo de activo
            </label>

            <select
              value={idTipoActivo}
              onChange={(e) =>
                setIdTipoActivo(
                  e.target.value
                )
              }
            >
              <option value="">
                Selecciona un tipo de activo
              </option>

              {tiposActivo.map(
                (tipo) => (
                  <option
                    key={tipo.id_tipo_activo}
                    value={tipo.id_tipo_activo}
                  >
                    {tipo.nombre}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="form-group">

            <label>
              Marca
            </label>

            <input
              type="text"
              value={marca}
              onChange={(e) =>
                setMarca(e.target.value)
              }
              placeholder="Ej. Dell"
            />

          </div>

          <div className="form-group">

            <label>
              Modelo
            </label>

            <input
              type="text"
              value={modelo}
              onChange={(e) =>
                setModelo(e.target.value)
              }
              placeholder="Ej. Latitude 5420"
            />

          </div>

          <div className="form-group">

            <label>
              Número de serie del equipo
            </label>

            <input
              type="text"
              value={numeroSerie}
              onChange={(e) =>
                setNumeroSerie(
                  e.target.value
                )
              }
              placeholder="Ej. ABC123456"
            />

          </div>

          {/* =========================
              ACCESORIOS Y LICENCIAS
              SOLO PC / LAPTOP
          ========================= */}

          {esEquipoComputo && (
            <>

              <div className="form-section-title">
                <h3>
                  Accesorios y licenciamientos
                </h3>

                <p>
                  Estos datos son opcionales.
                  Si el equipo no cuenta con alguno,
                  puedes dejar el campo vacío.
                </p>
              </div>

              <div className="form-group">

                <label>
                  Número de serie del mouse
                </label>

                <input
                  type="text"
                  value={numeroSerieMouse}
                  onChange={(e) =>
                    setNumeroSerieMouse(
                      e.target.value
                    )
                  }
                  placeholder="Ej. MOU-123456"
                />

              </div>

              <div className="form-group">

                <label>
                  Número de serie del teclado
                </label>

                <input
                  type="text"
                  value={numeroSerieTeclado}
                  onChange={(e) =>
                    setNumeroSerieTeclado(
                      e.target.value
                    )
                  }
                  placeholder="Ej. TEC-123456"
                />

              </div>

              <div className="form-group">

                <label>
                  Número de serie de la diadema
                </label>

                <input
                  type="text"
                  value={numeroSerieDiadema}
                  onChange={(e) =>
                    setNumeroSerieDiadema(
                      e.target.value
                    )
                  }
                  placeholder="Ej. DIA-123456"
                />

              </div>

              <div className="form-group">

                <label>
                  Número de serie del cargador
                </label>

                <input
                  type="text"
                  value={numeroSerieCargador}
                  onChange={(e) =>
                    setNumeroSerieCargador(
                      e.target.value
                    )
                  }
                  placeholder="Ej. CAR-123456"
                />

              </div>

              <div className="form-group">

                <label>
                  Licenciamientos
                </label>

                <textarea
                  value={licenciamientos}
                  onChange={(e) =>
                    setLicenciamientos(
                      e.target.value
                    )
                  }
                  placeholder="Ej. Windows 11 Pro, Microsoft Office 365, Bitdefender..."
                  rows={4}
                />

              </div>

            </>
          )}

          <button
            type="submit"
            className="primary-action-button"
            disabled={cargando}
          >
            {cargando
              ? "Registrando..."
              : "Registrar activo"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default RegistrarActivo;