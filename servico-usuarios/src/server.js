import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import usuariosRoutes from "./routes/usuarios.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const db = getDatabase();

// Testar conexão com banco
await db.connect();

app.use(express.json());
app.use(cors());

app.use("/usuarios", usuariosRoutes);

app.use(errorHandler);

app.listen(3001, "0.0.0.0", () => {
  console.log("Serviço de Usuários running on port 3001 👤");
});