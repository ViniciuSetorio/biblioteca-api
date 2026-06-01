import express from "express";
import cors from "cors";
import { customProxy } from "./middlewares/proxy.js";

export function createApp(serviceUrls = {}) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const allowedOrigins = [
    ...(process.env.FRONTEND_URL || "https://bibton.vercel.app")
      .split(",")
      .map((o) => o.trim().replace(/\/$/, "")),
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Permite requisições sem origin (ex: curl, Postman) ou origins na lista
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' não permitida`));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  const USUARIOS_URL = serviceUrls.usuarios || "https://biblioteca-usuarios.onrender.com";
  const LIVROS_URL = serviceUrls.livros || "https://biblioteca-livros.onrender.com";
  const EMPRESTIMOS_URL = serviceUrls.emprestimos || "https://biblioteca-emprestimos.onrender.com";
  const MULTAS_URL = serviceUrls.multas || "https://biblioteca-multas.onrender.com";

  app.use("/usuarios", customProxy(USUARIOS_URL));
  app.use("/livros", customProxy(LIVROS_URL));
  app.use("/emprestimos", customProxy(EMPRESTIMOS_URL));
  app.use("/reservas", customProxy(EMPRESTIMOS_URL));
  app.use("/multas", customProxy(MULTAS_URL));

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      retryConfig: "Axios + Axios-Retry (3 attempts)",
      services: {
        usuarios: USUARIOS_URL,
        livros: LIVROS_URL,
        emprestimos: EMPRESTIMOS_URL,
        multas: MULTAS_URL,
      },
    });
  });

  return app;
}
