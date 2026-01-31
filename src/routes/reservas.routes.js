import { Router } from "express";
import { createLibraryManager } from "../core/libraryManager.js";
import {
  CriarReservaSchema,
  ReservaIdParamsSchema,
  ListarReservasQuerySchema,
} from "../schemas/reservas.schema.js";

const LibraryManager = createLibraryManager();
const router = Router();

// POST /reservas - Criar nova reserva
router.post("/", async (req, res) => {
  try {
    const data = CriarReservaSchema.parse(req.body);
    const reserva = await LibraryManager.criarReserva(data);
    return res.status(201).json(reserva);
  } catch (err) {
    const msg = String(err.message || "");
    if (msg.includes("não encontrado")) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// GET /reservas - Listar reservas com filtros
router.get("/", async (req, res) => {
  try {
    const filters = ListarReservasQuerySchema.parse(req.query);
    const lista = await LibraryManager.listarReservas(filters);
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /reservas/:reservaId - Obter reserva específica
router.get("/:reservaId", async (req, res) => {
  try {
    const { reservaId } = ReservaIdParamsSchema.parse(req.params);
    const reserva = await LibraryManager.obterReserva({ reservaId });
    return res.status(200).json(reserva);
  } catch (err) {
    const msg = String(err.message || "");
    if (msg.includes("não encontrad")) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// PATCH /reservas/:reservaId/cancelar - Cancelar reserva
router.patch("/:reservaId/cancelar", async (req, res) => {
  try {
    const { reservaId } = ReservaIdParamsSchema.parse(req.params);
    const reserva = await LibraryManager.cancelarReserva({ reservaId });
    return res.status(200).json(reserva);
  } catch (err) {
    const msg = String(err.message || "");
    if (msg.includes("não encontrad")) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

export default router;
