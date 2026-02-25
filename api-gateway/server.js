import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import { generateOpenApiDocumentation } from "./config/openapi.js";
import { apiReference } from "@scalar/express-api-reference";

const app = express();

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// Rotas para cada microsserviço
app.use("/usuarios", proxy("http://servico-usuarios:3001"));
app.use("/livros", proxy("http://servico-livros:3002"));
app.use("/emprestimos", proxy("http://servico-emprestimos:3003"));
app.use("/reservas", proxy("http://servico-emprestimos:3003/reservas"));
app.use("/multas", proxy("http://servico-multas:3004"));

// Documentação unificada
const openApiDocumentation = generateOpenApiDocumentation();

app.get("/openapi.json", (_, res) => {
  res.json(openApiDocumentation);
});

app.use("/docs", apiReference({
  spec: { url: "/openapi.json" },
}));

app.listen(3000, "0.0.0.0", () => {
  console.log("API Gateway running on http://localhost:3000 🚀");
  console.log("Docs available on http://localhost:3000/docs 📚");
});