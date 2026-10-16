import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logoDL from "../assets/logo-dl.png";
import Logo3D from "../components/logo3d/Logo3D";
import estilos from "./Login.module.css";

type LoginProps = {
  onLogin: (token: string) => void;
};

function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sacudir, setSacudir] = useState(false);

  const iniciarSesion = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await api.post("/auth/login", {
        nombre_usuario: nombreUsuario,
        password
      });

      const { token, usuario } = respuesta.data;

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Actualiza inmediatamente el estado de sesión en App.tsx
      onLogin(token);

      // Envía al Dashboard sin necesidad de refrescar
      navigate("/", { replace: true });

    } catch (error: any) {
      const mensajeError =
        error.response?.data?.mensaje ||
        "No fue posible iniciar sesión";

      setMensaje(mensajeError);
      setSacudir(true);

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={estilos.pagina}>

      {/* Manchas de luz del fondo */}
      <div className={`${estilos.brillo} ${estilos.brillo1}`} />
      <div className={`${estilos.brillo} ${estilos.brillo2}`} />
      <div className={`${estilos.brillo} ${estilos.brillo3}`} />

      {/* Logo en 3D (decorativo) */}
      <div className={estilos.zonaLogo}>
        <Logo3D imagen={logoDL} className={estilos.logo3d} />
      </div>

      <div className={estilos.contenido}>

        <form
          className={`${estilos.formulario} ${sacudir ? estilos.sacudir : ""}`}
          onSubmit={iniciarSesion}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) setSacudir(false);
          }}
        >

          
          <svg
            width="0"
            height="0"
            style={{ position: "absolute" }}
            aria-hidden="true"
            focusable="false"
          >
            <filter
              id="dl-logo-verde"
              colorInterpolationFilters="sRGB"
            >
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.075
                        0 0 0 0 0.431
                        0 0 0 0 0.2
                        -0.349 -1.173 -0.118 0 1.574"
              />
            </filter>
          </svg>

          <img
            src={logoDL}
            alt="DL Corporativo"
            className={estilos.logo}
          />

          <h1 className={estilos.titulo}>
            Sistema para el Control de Activos
          </h1>

          <p className={estilos.subtitulo}>
            Ingresa tus credenciales para continuar
          </p>

          <div className={estilos.campo}>
            <input
              id="usuario"
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="Usuario"
              aria-label="Usuario"
              autoComplete="username"
              required
            />
          </div>

          <div className={`${estilos.campo} ${estilos.clave}`}>
            <input
              id="password"
              type={verPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              aria-label="Contraseña"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className={estilos.ojo}
              onClick={() => setVerPassword((v) => !v)}
              aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {verPassword && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </div>

          {mensaje && (
            <div className={estilos.error} role="alert">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className={estilos.enviar}
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
