import express from "express";
import cors from "cors";
import { apiReference } from "@scalar/express-api-reference";
import emprestimosRoutes from "./routes/emprestimos.routes.js";
import { generateOpenApiDocumentation } from "./config/openapi.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.get("/health", (_, res) => res.json({ status: "ok" }));

  app.use("/emprestimos", emprestimosRoutes);

  const openApiDocumentation = generateOpenApiDocumentation();
  app.get("/openapi.json", (_, res) => res.json(openApiDocumentation));

  app.use("/docs", apiReference({ spec: { url: "/openapi.json" } }));

  return app;
}
