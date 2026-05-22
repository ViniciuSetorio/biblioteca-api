import getDatabase from "./config/database.js";
import { createApp } from "./app.js";

const db = getDatabase();
const app = createApp(db);

const PORT = process.env.PORT || 3003;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Empréstimos rodando na porta ${PORT} 📅`);
});
