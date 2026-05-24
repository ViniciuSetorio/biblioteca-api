import { Router } from "express";
import notificacoesController from "../controllers/notificacoes.controller.js";

const router = Router();

// Rota principal para enviar notificações
router.post("/", notificacoesController.enviarNotificacao);

// Rotas específicas por canal
router.post("/email", notificacoesController.enviarEmail);
router.post("/sms", notificacoesController.enviarSms);

// Rota para verificar status da fila (opcional, para debug)
router.get("/fila", notificacoesController.statusFila);

export default router;
