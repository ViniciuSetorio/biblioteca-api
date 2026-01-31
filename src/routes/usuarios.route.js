import { Router } from "express";
import usuariosController from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/", usuariosController.pegarTodosOsUsuarios);
router.get("/:id", usuariosController.pegarUsuarioPorId);
router.post("/", usuariosController.adicionarUsuario);
router.put("/:id", usuariosController.atualizarUsuario);
router.delete("/:id", usuariosController.deletarUsuario);

export default router;
