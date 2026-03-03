import express from 'express';
import cors from 'cors';
import { customProxy } from "./middlewares/proxy.js";

const app = express();

// CORS mais permissivo para produção
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://bibton.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Helper para filtrar placeholders literais como ${VAR} que o Render às vezes injeta
const getEnvVar = (v, fallback) => {
  const val = process.env[v];
  return (val && !val.includes("${")) ? val : fallback;
};

// URLs dos serviços (podem vir de variáveis de ambiente)
const USUARIOS_URL = getEnvVar("USUARIOS_URL", "http://servico-usuarios:3001");
const LIVROS_URL = getEnvVar("LIVROS_URL", "http://servico-livros:3002");
const EMPRESTIMOS_URL = getEnvVar(
  "EMPRESTIMOS_URL",
  "http://servico-emprestimos:3003",
);
const MULTAS_URL = getEnvVar("MULTAS_URL", "http://servico-multas:3004");

// Rotas para cada microsserviço usando proxy com retry
app.use("/usuarios", customProxy(USUARIOS_URL));
app.use("/livros", customProxy(LIVROS_URL));
app.use("/emprestimos", customProxy(EMPRESTIMOS_URL));
app.use("/reservas", customProxy(EMPRESTIMOS_URL));
app.use("/multas", customProxy(MULTAS_URL));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    retryConfig: "Axios + Axios-Retry (5 attempts)",
    services: {
      usuarios: USUARIOS_URL,
      livros: LIVROS_URL,
      emprestimos: EMPRESTIMOS_URL,
      multas: MULTAS_URL,
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
  console.log(`   🔗 http://localhost:${PORT}`);
  console.log(`   📚 Usuários: ${USUARIOS_URL}`);
  console.log(`   📚 Livros: ${LIVROS_URL}`);
  console.log(`   📚 Empréstimos: ${EMPRESTIMOS_URL}`);
  console.log(`   📚 Multas: ${MULTAS_URL}`);
});