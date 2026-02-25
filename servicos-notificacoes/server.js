import express from "express";
import cors from "cors";
import notificacoesRoutes from "./routes/notificacoes.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/notificacoes", notificacoesRoutes);

app.listen(3005, "0.0.0.0", () => {
  console.log("Serviço de Notificações running on port 3005 📧");
});