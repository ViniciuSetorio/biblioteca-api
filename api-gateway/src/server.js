import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app = express();

// CORS mais permissivo para produção
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// URLs dos serviços (podem vir de variáveis de ambiente)
const USUARIOS_URL = process.env.USUARIOS_URL || 'http://servico-usuarios:3001';
const LIVROS_URL = process.env.LIVROS_URL || 'http://servico-livros:3002';
const EMPRESTIMOS_URL = process.env.EMPRESTIMOS_URL || 'http://servico-emprestimos:3003';
const MULTAS_URL = process.env.MULTAS_URL || 'http://servico-multas:3004';

// Rotas para cada microsserviço
app.use("/usuarios", proxy(USUARIOS_URL));
app.use("/livros", proxy(LIVROS_URL));
app.use("/emprestimos", proxy(EMPRESTIMOS_URL));
app.use("/reservas", proxy(`${EMPRESTIMOS_URL}/reservas`));
app.use("/multas", proxy(MULTAS_URL));

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    services: {
      usuarios: USUARIOS_URL,
      livros: LIVROS_URL,
      emprestimos: EMPRESTIMOS_URL,
      multas: MULTAS_URL
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API Gateway rodando na porta ${PORT} 🚀`);
  console.log(`   🔗 http://localhost:${PORT}`);
  console.log(`   📚 Usuários: ${USUARIOS_URL}`);
  console.log(`   📚 Livros: ${LIVROS_URL}`);
  console.log(`   📚 Empréstimos: ${EMPRESTIMOS_URL}`);
  console.log(`   📚 Multas: ${MULTAS_URL}`);
});