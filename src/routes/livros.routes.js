import { Router } from "express";
import livroController from "../controllers/livros.controller.js";

const router = Router();

router.get("/", livroController.pegarTodosOsLivros);
router.get("/:id", livroController.pegarLivroPorId);
router.post("/", livroController.adicionarLivro);
router.put("/livros/:id", livroController.atualizarLivro);
router.delete("/livros/:id", livroController.deletarLivro);

export default router;
