import { Router } from "express";
import emprestimosController from "../controllers/emprestimos.controller.js";

const router = Router();

router.post("/", emprestimosController.criarEmprestimo);
router.patch("/:emprestimoId/devolucao", emprestimosController.devolverLivro);
router.get("/", emprestimosController.listarEmprestimos);
router.get("/:emprestimoId", emprestimosController.obterEmprestimo);

export default router;