import { Router } from "express";
import reservasController from "../controllers/reservas.controller.js";

const router = Router();

router.route("/").get(reservasController.listarReservas);
router.route("/").post(reservasController.criarReserva);
router.route("/:reservaId").get(reservasController.obterReserva);
router.route("/:reservaId").delete(reservasController.cancelarReserva);

export default router;
