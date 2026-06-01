import { createApp } from "./app.js";

const serviceUrls = {
  usuarios: process.env.USUARIOS_URL,
  livros: process.env.LIVROS_URL,
  emprestimos: process.env.EMPRESTIMOS_URL,
  multas: process.env.MULTAS_URL,
};

const app = createApp(serviceUrls);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
  console.log(`   🔗 http://localhost:${PORT}`);
  console.log(`   📍 Serviços:`);
  console.log(`      - Usuários: ${serviceUrls.usuarios || "https://biblioteca-usuarios.onrender.com"}`);
  console.log(`      - Livros: ${serviceUrls.livros || "https://biblioteca-livros.onrender.com"}`);
  console.log(`      - Empréstimos: ${serviceUrls.emprestimos || "https://biblioteca-emprestimos.onrender.com"}`);
  console.log(`      - Multas: ${serviceUrls.multas || "https://biblioteca-multas.onrender.com"}`);
});
