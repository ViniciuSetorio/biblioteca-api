// Importa o Router do Express que é usado para criar um conjunto de rotas
import { Router } from "express";

// Esse controller é carregado UMA ÚNICA VEZ pelo Node.js
// Todas as rotas irão reutilizar essa mesma instância (Singleton)
import reservasController from "../controllers/reservas.controller.js";

// Esse objeto será responsável apenas por definir as rotas
const router = Router();

// Define uma rota para criar uma nova reserva
// A rota chama um método do Singleton
router.post("/", reservasController.criarReserva);

// Lista todas as reservas
// Usa o mesmo controller
router.get("/", reservasController.listarReservas);

// Busca uma reserva pelo ID
// O controller continua sendo o mesmo
router.get("/:reservaId", reservasController.obterReserva);

// Cancela uma reserva
// Atualização parcial usando PATCH
router.patch("/:reservaId/cancelar", reservasController.cancelarReserva);

// Exporta o router para ser usado no app principal
export default router;


