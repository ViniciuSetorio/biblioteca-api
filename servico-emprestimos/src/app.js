import express from "express";
import cors from "cors";
import emprestimosRoutes from "./routes/emprestimos.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(db) {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.get(["/health", "/emprestimos/health", "/reservas/health"], (req, res) => {
    res.json({
      status: "healthy",
      service: "emprestimos-service",
      timestamp: new Date().toISOString(),
    });
  });

  // Make db available to routes via app locals
  app.locals.db = db;

  app.use("/emprestimos", emprestimosRoutes);
  app.use("/reservas", reservasRoutes);
  app.use(errorHandler);

  return app;
}
