import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import livrosRoutes from "./routes/livros.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const db = getDatabase();

try {
  await db.connect();
  console.log("✅ Conectado ao banco de livros");
} catch (error) {
  console.error("❌ Erro ao conectar no banco:", error);
}

app.use(express.json());
app.use(cors());

app.use("/livros", livrosRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Livros rodando na porta ${PORT} 📚`);
});