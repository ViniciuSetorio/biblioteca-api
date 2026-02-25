import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import livrosRoutes from "./routes/livros.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/livros", livrosRoutes);

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
    .catch(() =>
      res.status(500).json({
        status: "unhealthy",
        error: "Database connection failed",
      }),
    );
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Livros rodando na porta ${PORT} 📚`);
});