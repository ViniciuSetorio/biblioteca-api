import { createApp } from "./app.js";

const app = createApp();

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
  console.log(`   🔗 http://localhost:${PORT}`);
});
