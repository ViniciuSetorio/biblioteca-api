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
const CriarReservaBodySchema = z.object({
  usuarioId: z.number().int().positive(),
  livroId: z.number().int().positive(),
});

const ReservaIdParamsSchema = z.object({
  reservaId: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ param: { name: "reservaId", in: "path", required: true } }),
});

const ListarReservasQuerySchema = z.object({
  status: z
    .enum(["ativa", "cancelada", "expirada"])
    .optional()
    .openapi({ param: { name: "status", in: "query" } }),
  usuarioId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ param: { name: "usuarioId", in: "query" } }),
  livroId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ param: { name: "livroId", in: "query" } }),
});

/*
 * OpenAPI registrations
 */
registry.registerPath({
  method: "post",
  path: "/reservas",
  tags: ["Reservas"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CriarReservaBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Reserva criada com sucesso",
      content: { "application/json": { schema: z.any() } },
    },
    400: {
      description: "Erro de validação ou regra de negócio",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    404: {
      description: "Livro não encontrado",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/reservas/{reservaId}/cancelar",
  tags: ["Reservas"],
  request: {
    params: ReservaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Reserva cancelada com sucesso",
      content: { "application/json": { schema: z.any() } },
    },
    400: {
      description: "Erro de validação ou regra de negócio",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    404: {
      description: "Reserva não encontrada",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/reservas",
  tags: ["Reservas"],
  request: {
    query: ListarReservasQuerySchema,
  },
  responses: {
    200: {
      description: "Lista de reservas",
      content: { "application/json": { schema: z.array(z.any()) } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/reservas/{reservaId}",
  tags: ["Reservas"],
  request: {
    params: ReservaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Reserva encontrada",
      content: { "application/json": { schema: z.any() } },
    },
    404: {
      description: "Reserva não encontrada",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

/*
 * Routes
 */

// POST /reservas
router.post("/", async (req, res) => {
  try {
    const data = CriarReservaBodySchema.parse(req.body);
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

// PATCH /reservas/:reservaId/cancelar
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

// GET /reservas?status=&usuarioId=&livroId=
router.get("/", async (req, res) => {
  try {
    const filters = ListarReservasQuerySchema.parse(req.query);
    const lista = await LibraryManager.listarReservas(filters);
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /reservas/:reservaId
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

export default router;
