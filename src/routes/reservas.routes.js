import { Router } from "express";
import reservasController from "../controllers/reservas.controller.js";

const router = Router();

// POST /reservas - Criar nova reserva
router.post("/", reservasController.criarReserva);

// GET /reservas - Listar reservas com filtros
router.get("/", reservasController.listarReservas);

// GET /reservas/:reservaId - Obter reserva específica
router.get("/:reservaId", reservasController.obterReserva);

// PATCH /reservas/:reservaId/cancelar - Cancelar reserva
router.patch("/:reservaId/cancelar", reservasController.cancelarReserva);

export default router;
