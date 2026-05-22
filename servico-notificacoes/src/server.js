import { createApp } from "./app.js";

const app = createApp();

const PORT = process.env.PORT || 3005;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Notificações rodando na porta ${PORT} 📧`);
});
