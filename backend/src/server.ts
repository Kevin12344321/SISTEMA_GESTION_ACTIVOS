import express from "express";
import activosRoutes from "./routes/activos.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import asignacionesRoutes from "./routes/asignaciones.routes";
import catalogosRoutes from "./routes/catalogos.routes";
import authRoutes from "./routes/auth.routes";
import historialRoutes from "./routes/historial.routes";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensaje: "API del sistema de gestión de activos funcionando"
  });
});

app.use("/activos", activosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/asignaciones", asignacionesRoutes);
app.use("/catalogos", catalogosRoutes);
app.use("/auth", authRoutes);
app.use("/historial", historialRoutes);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});