import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import emprestimosRoutes from "./routes/emprestimos.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/emprestimos", emprestimosRoutes);
app.use("/reservas", reservasRoutes);

app.use(errorHandler);

app.get("/health", (req, res) => {
  const db = getDatabase();
  db.query("SELECT 1")
    .then(() =>
      res.json({
        status: "healthy",
        service: process.env.RENDER_SERVICE_NAME || "unknown",
        database: "connected",
        timestamp: new Date().toISOString(),
      }),
    )
    .catch((err) =>
      res.status(500).json({
        status: "unhealthy",
        error: err.message,
      }),
    );
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Empréstimos rodando na porta ${PORT} 📅`);
});