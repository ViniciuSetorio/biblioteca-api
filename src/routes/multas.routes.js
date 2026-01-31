import { Router } from "express";
import { z } from "zod";
import { createLibraryManager } from "../core/libraryManager.js";
import { getRegistry } from "../config/openapi.js";

const LibraryManager = createLibraryManager();

const registry = getRegistry();

const router = Router();

/*
 * Schemas (Zod)
 */
const MultaIdParamsSchema = z.object({
  multaId: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ param: { name: "multaId", in: "path", required: true } }),
});

const ListarMultasQuerySchema = z.object({
  pago: z.coerce
    .boolean()
    .optional()
    .openapi({ param: { name: "pago", in: "query" } }),
  usuarioId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ param: { name: "usuarioId", in: "query" } }),
});

/*
 * OpenAPI registrations
 */
registry.registerPath({
  method: "get",
  path: "/multas",
  tags: ["Multas"],
  request: {
    query: ListarMultasQuerySchema,
  },
  responses: {
    200: {
      description: "Lista de multas",
      content: { "application/json": { schema: z.array(z.any()) } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/multas/{multaId}",
  tags: ["Multas"],
  request: {
    params: MultaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Multa encontrada",
      content: { "application/json": { schema: z.any() } },
    },
    404: {
      description: "Multa não encontrada",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/multas/{multaId}/pagar",
  tags: ["Multas"],
  request: {
    params: MultaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Multa paga com sucesso",
      content: { "application/json": { schema: z.any() } },
    },
    400: {
      description: "Erro de validação ou regra de negócio",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    404: {
      description: "Multa não encontrada",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

/*
 * Routes
 */

// GET /multas?pago=&usuarioId=
router.get("/", async (req, res) => {
  try {
    const filters = ListarMultasQuerySchema.parse(req.query);
    const lista = await LibraryManager.listarMultas(filters);
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /multas/:multaId
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

// PATCH /multas/:multaId/pagar
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
