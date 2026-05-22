import express from "express";
import cors from "cors";
import notificacoesRoutes from "./routes/notificacoes.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.get(["/health", "/notificacoes/health"], (req, res) => {
    res.json({
      status: "healthy",
      service: "notificacoes-service",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/notificacoes", notificacoesRoutes);

  return app;
}
