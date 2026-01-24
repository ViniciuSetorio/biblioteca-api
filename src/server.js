import express from "express";
import cors from "cors";
import { generateOpenApiDocumentation } from "./config/openapi.js";
import { apiReference } from "@scalar/express-api-reference";
import emprestimosRoutes from "./routes/emprestimos.routes.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use("/emprestimos", emprestimosRoutes);

const openApiDocumentation = generateOpenApiDocumentation();

app.get("/openapi.json", (_, res) => {
  res.json(openApiDocumentation);
});

app.use(
  "/docs",
  apiReference({
    spec: {
      url: "/openapi.json",
    },
  }),
);

app.listen({ port: 3000, host: "0.0.0.0" }, () => {
  console.log("HTTP server running on http://localhost:3000 🚀");
  console.log("Docs available on http://localhost:3000/docs 📚");
});
