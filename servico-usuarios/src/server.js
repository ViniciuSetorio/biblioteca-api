import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import usuariosRoutes from "./routes/usuarios.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get(["/health", "/usuarios/health"], (req, res) => {
  res.json({
    status: "healthy",
    service: process.env.RENDER_SERVICE_NAME || "usuarios-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/usuarios", usuariosRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serviço de Usuários running on port ${PORT} 👤`);
});