import { Router } from "express";
import { z } from "zod";
import LibraryManager from "../core/libraryManager.js";
import { registry } from "../config/openapi.js";

const router = Router();

/*
 * Schemas (Zod)
 */
const EmprestarBodySchema = z.object({
  usuarioId: z.number().int().positive(),
  livroId: z.number().int().positive(),
});

const EmprestimoIdParamsSchema = z.object({
  emprestimoId: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ param: { name: "emprestimoId", in: "path", required: true } }),
});

const ListarQuerySchema = z.object({
  status: z
    .enum(["ativo", "atrasado", "devolvido"])
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
 * (registradas aqui para que apareçam no /docs quando o server importar as rotas antes de gerar o documento)
 */
registry.registerPath({
  method: "post",
  path: "/emprestimos",
  tags: ["Empréstimos"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmprestarBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Empréstimo criado com sucesso",
      content: { "application/json": { schema: z.any() } },
    },
    400: {
      description: "Erro de validação ou regra de negócio",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/emprestimos/{emprestimoId}/devolucao",
  tags: ["Empréstimos"],
  request: {
    params: EmprestimoIdParamsSchema,
  },
  responses: {
    200: {
      description: "Devolução registrada com sucesso",
      content: { "application/json": { schema: z.any() } },
    },
    400: {
      description: "Erro de validação ou regra de negócio",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/emprestimos",
  tags: ["Empréstimos"],
  request: {
    query: ListarQuerySchema,
  },
  responses: {
    200: {
      description: "Lista de empréstimos",
      content: { "application/json": { schema: z.array(z.any()) } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/emprestimos/{emprestimoId}",
  tags: ["Empréstimos"],
  request: {
    params: EmprestimoIdParamsSchema,
  },
  responses: {
    200: {
      description: "Empréstimo encontrado",
      content: { "application/json": { schema: z.any() } },
    },
    404: {
      description: "Empréstimo não encontrado",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

/*
 * Routes
 */

// POST /emprestimos
router.post("/", async (req, res) => {
  try {
    const data = EmprestarBodySchema.parse(req.body);
    const emprestimo = await LibraryManager.emprestarLivro(data);
    return res.status(201).json(emprestimo);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /emprestimos/:emprestimoId/devolucao
router.patch("/:emprestimoId/devolucao", async (req, res) => {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const devolucao = await LibraryManager.devolverLivro({ emprestimoId });
    return res.status(200).json(devolucao);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /emprestimos?status=&usuarioId=&livroId=
router.get("/", async (req, res) => {
  try {
    const filters = ListarQuerySchema.parse(req.query);
    const lista = await LibraryManager.listarEmprestimos(filters);
    return res.status(200).json(lista);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /emprestimos/:emprestimoId
router.get("/:emprestimoId", async (req, res) => {
  try {
    const { emprestimoId } = EmprestimoIdParamsSchema.parse(req.params);
    const emprestimo = await LibraryManager.obterEmprestimo({ emprestimoId });
    return res.status(200).json(emprestimo);
  } catch (err) {
    const msg = String(err.message || "");
    if (msg.includes("não encontrado")) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

export default router;
