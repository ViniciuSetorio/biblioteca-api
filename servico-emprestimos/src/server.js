import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import emprestimosRoutes from "./routes/emprestimos.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get(["/health", "/emprestimos/health", "/reservas/health"], (req, res) => {
  res.json({
    status: "healthy",
    service: process.env.RENDER_SERVICE_NAME || "known",
    timestamp: new Date().toISOString(),
  });
});

app.use("/emprestimos", emprestimosRoutes);
app.use("/reservas", reservasRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3003;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Empréstimos rodando na porta ${PORT} 📅`);
});