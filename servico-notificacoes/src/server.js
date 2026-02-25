import express from "express";
import cors from "cors";
import notificacoesRoutes from "./routes/notificacoes.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/notificacoes", notificacoesRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Notificações rodando na porta ${PORT} 📧`);
});