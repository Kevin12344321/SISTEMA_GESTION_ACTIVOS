import bcrypt from "bcryptjs";

const password = "Consulta1234";

const generarHash = async () => {
  const hash = await bcrypt.hash(password, 10);

  console.log("Contraseña:", password);
  console.log("Hash:", hash);
};

generarHash();