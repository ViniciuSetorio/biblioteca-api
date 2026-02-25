import { Router } from "express";
import notificacoesController from "../controllers/notificacoes.controller.js";

const router = Router();

// Rota principal para enviar notificações
router.post("/", notificacoesController.enviarNotificacao);

// Rota para verificar status da fila (opcional, para debug)
router.get("/fila", notificacoesController.statusFila);

export default router;