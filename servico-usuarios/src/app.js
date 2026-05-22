import express from "express";
import cors from "cors";
import usuariosRoutes from "./routes/usuarios.route.js";
import createUsuariosService from "./services/usuarios.service.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(db) {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.get(["/health", "/usuarios/health"], (req, res) => {
    res.json({
      status: "healthy",
      service: "usuarios-service",
      timestamp: new Date().toISOString(),
    });
  });

  const usuariosService = createUsuariosService(db);

  // Attach service to routes via a wrapper that injects the service
  app.use("/usuarios", (req, res, next) => {
    req.usuariosService = usuariosService;
    next();
  });

  // Re-create routes with injected service
  const router = express.Router();
  router.route("/").get(async (req, res) => {
    try {
      const usuarios = await usuariosService.buscarUsuarios();
      return res.status(200).json(usuarios);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro ao buscar usuários", code: "INTERNAL_ERROR" });
    }
  });

  router.route("/").post(async (req, res) => {
    try {
      const usuario = await usuariosService.criarUsuario(req.body);
      return res.status(201).json(usuario);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro ao criar usuário", code: "INTERNAL_ERROR" });
    }
  });

  router.route("/:id").get(async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        return res.status(400).json({ message: "ID de usuário inválido", code: "INVALID_ID" });
      }
      const usuario = await usuariosService.buscarUsuarioPorId(numericId);
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado", code: "USER_NOT_FOUND" });
      }
      return res.status(200).json(usuario);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro ao buscar usuário", code: "INTERNAL_ERROR" });
    }
  });

  router.route("/:id").put(async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        return res.status(400).json({ message: "ID de usuário inválido", code: "INVALID_ID" });
      }
      const usuario = await usuariosService.modificarUsuario(numericId, req.body);
      return res.status(200).json(usuario);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro ao atualizar usuário", code: "INTERNAL_ERROR" });
    }
  });

  router.route("/:id").delete(async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        return res.status(400).json({ message: "ID de usuário inválido", code: "INVALID_ID" });
      }
      const usuario = await usuariosService.removerUsuario(numericId);
      return res.status(200).json(usuario);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message, code: err.code });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro ao remover usuário", code: "INTERNAL_ERROR" });
    }
  });

  app.use("/usuarios", router);
  app.use(errorHandler);

  return app;
}
