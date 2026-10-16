import logoDL from "../assets/logo-dl.png";

function LogoEmpresa() {
  return (
    <div className="logo-empresa">
      <img
        src={logoDL}
        alt="DL Corporativo"
      />

      <div className="logo-empresa-texto">
        <strong>
          Sistema para el Control de Activos
        </strong>
      </div>
    </div>
  );
}

export default LogoEmpresa;