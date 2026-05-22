import express from "express";
import cors from "cors";
import multasRoutes from "./routes/multas.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(db) {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.get(["/health", "/multas/health"], (req, res) => {
    res.json({
      status: "healthy",
      service: "multas-service",
      timestamp: new Date().toISOString(),
    });
  });

  app.locals.db = db;

  app.use("/multas", multasRoutes);
  app.use(errorHandler);

  return app;
}
