import { Router } from "express";
import usuariosController from "../controllers/usuarios.controller.js";

const router = Router();

router.route("/").get(usuariosController.pegarTodosOsUsuarios);
router.route("/").post(usuariosController.adicionarUsuario);
router.route("/:id").get(usuariosController.pegarUsuarioPorId);
router.route("/:id").put(usuariosController.atualizarUsuario);
router.route("/:id").delete(usuariosController.deletarUsuario);

export default router;
