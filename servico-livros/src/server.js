import getDatabase from "./config/database.js";
import { createApp } from "./app.js";

const db = getDatabase();
const app = createApp(db);

const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serviço de Livros rodando na porta ${PORT} 📚`);
});
