import express from "express";
import cors from "cors";
import notificacoesRoutes from "./routes/notificacoes.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/notificacoes", notificacoesRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: process.env.RENDER_SERVICE_NAME || "notificacoes-service",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Notificações rodando na porta ${PORT} 📧`);
});