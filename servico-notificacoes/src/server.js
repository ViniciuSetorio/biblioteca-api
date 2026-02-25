import express from "express";
import cors from "cors";
import notificacoesRoutes from "./routes/notificacoes.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/notificacoes", notificacoesRoutes);

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
    .catch(() =>
      res.status(500).json({
        status: "unhealthy",
        error: "Database connection failed",
      }),
    );
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Notificações rodando na porta ${PORT} 📧`);
});