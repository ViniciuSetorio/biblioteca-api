import { Router } from "express";
import multasController from "../controllers/multas.controller.js";

const router = Router();

// GET /multas - Listar multas com filtros
router.get("/", multasController.listarMultas);

// GET /multas/:multaId - Obter multa específica
router.get("/:multaId", multasController.obterMulta);

// PATCH /multas/:multaId/pagar - Pagar multa
router.patch("/:multaId/pagar", multasController.pagarMulta);

export default router;
