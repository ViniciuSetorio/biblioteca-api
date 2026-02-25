import express from "express";
import cors from "cors";
import getDatabase from "./config/database.js";
import multasRoutes from "./routes/multas.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const db = getDatabase();

await db.connect();

app.use(express.json());
app.use(cors());

app.use("/multas", multasRoutes);

app.use(errorHandler);

app.listen(3004, "0.0.0.0", () => {
  console.log("Serviço de Multas running on port 3004 💰");
});