import { Router } from "express";
import multasController from "../controllers/multas.controller.js";

const router = Router();

router.get("/", multasController.listarMultas);
router.get("/:multaId", multasController.obterMulta);
router.post("/", multasController.criarMulta);
router.patch("/:multaId/pagar", multasController.pagarMulta);

export default router;