import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import emprestimosRoutes from "./routes/emprestimos.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const db = getDatabase();

try {
  await db.connect();
  console.log("✅ Conectado ao banco de empréstimos");
} catch (error) {
  console.error("❌ Erro ao conectar no banco:", error);
}

app.use(express.json());
app.use(cors());

app.use("/emprestimos", emprestimosRoutes);
app.use("/reservas", reservasRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3003;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Empréstimos rodando na porta ${PORT} 📅`);
});