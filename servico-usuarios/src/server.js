import { createApp } from "./app.js";
import getDatabase from "./config/database.js";

const db = getDatabase();
const app = createApp(db);

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serviço de Usuários running on port ${PORT} 👤`);
});
