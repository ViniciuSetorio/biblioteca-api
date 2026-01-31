import { Router } from "express";
import { createLibraryManager } from "../core/libraryManager.js";
import {
  MultaIdParamsSchema,
  ListarMultasQuerySchema,
} from "../schemas/multas.schema.js";

const LibraryManager = createLibraryManager();
const router = Router();

// GET /multas - Listar multas com filtros
router.get("/", async (req, res) => {
  try {
    const filters = ListarMultasQuerySchema.parse(req.query);
    const lista = await LibraryManager.listarMultas(filters);
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /multas/:multaId - Obter multa específica
router.get("/:multaId", async (req, res) => {
  try {
    const { multaId } = MultaIdParamsSchema.parse(req.params);
    const multa = await LibraryManager.obterMulta({ multaId });
    return res.status(200).json(multa);
  } catch (err) {
    const msg = String(err.message || "");
    if (msg.includes("não encontrad")) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// PATCH /multas/:multaId/pagar - Pagar multa
router.patch("/:multaId/pagar", async (req, res) => {
  try {
    const { multaId } = MultaIdParamsSchema.parse(req.params);
    const multa = await LibraryManager.pagarMulta({ multaId });
    return res.status(200).json(multa);
  } catch (err) {
    const msg = String(err.message || "");
    if (msg.includes("não encontrad")) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

export default router;
