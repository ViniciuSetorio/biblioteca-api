import express from "express";
import cors from "cors";
import { generateOpenApiDocumentation } from "./config/openapi.js";
import { apiReference } from "@scalar/express-api-reference";
import usuariosRoutes from "./routes/usuarios.route.js";
import emprestimosRoutes from "./routes/emprestimos.routes.js";
import livrosRoutes from "./routes/livros.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import multasRoutes from "./routes/multas.routes.js";

import "./docs/usuarios.docs.js";
import "./docs/livros.docs.js";
import "./docs/reservas.docs.js";
import "./docs/multas.docs.js";
import "./docs/emprestimos.docs.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use("/usuarios", usuariosRoutes);
app.use("/emprestimos", emprestimosRoutes);
app.use("/livros", livrosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/multas", multasRoutes);

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