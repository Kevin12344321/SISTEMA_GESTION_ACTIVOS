import { useNavigate } from "react-router-dom";
import LogoEmpresa from "../components/LogoEmpresa";

type DashboardProps = {
  onLogout: () => void;
};

function Dashboard({ onLogout }: DashboardProps) {
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const cerrarSesion = () => {
    // App.tsx elimina token y usuario
    // y actualiza el estado inmediatamente
    onLogout();

    // Enviar al login sin necesidad de refrescar
    navigate("/login", {
      replace: true
    });
  };

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">

      <div>
  <LogoEmpresa />

  <p>
    Panel de administración
  </p>
</div>

        <div className="dashboard-user">

          <div>
            <strong>
              {usuario?.nombre_usuario || "Usuario"}
            </strong>

            <span>
              {usuario?.rol || ""}
            </span>
          </div>

          <button
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

        </div>

      </header>

      <main className="dashboard-content">

        <section className="welcome-section">

          <h2>
            Bienvenido al sistema
          </h2>

          <p>
            Selecciona el módulo que deseas consultar.
          </p>

        </section>

        <section className="dashboard-grid">

          <button
            className="module-card"
            onClick={() =>
              navigate("/activos")
            }
          >

            <span className="module-icon">
              💻
            </span>

            <div>
              <h3>Activos</h3>

              <p>
                Consulta y administra los activos
                registrados.
              </p>
            </div>

          </button>

          {usuario?.rol === "Administrador" && (
            <>

              <button
                className="module-card"
                onClick={() =>
                  navigate("/usuarios")
                }
              >

                <span className="module-icon">
                  👥
                </span>

                <div>
                  <h3>
                    Usuarios
                  </h3>

                  <p>
                    Consulta y registra usuarios
                    del sistema.
                  </p>
                </div>

              </button>

              <button
                className="module-card"
                onClick={() =>
                  navigate("/catalogos")
                }
              >

                <span className="module-icon">
                  📋
                </span>

                <div>
                  <h3>
                    Catálogos
                  </h3>

                  <p>
                    Administra áreas, naves,
                    ubicaciones y razones sociales.
                  </p>
                </div>

              </button>

              <button
                className="module-card"
                onClick={() =>
                  navigate("/historial")
                }
              >

                <span className="module-icon">
                  🕒
                </span>

                <div>
                  <h3>
                    Historial
                  </h3>

                  <p>
                    Consulta los movimientos
                    realizados sobre los activos.
                  </p>
                </div>

              </button>

            </>
          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;