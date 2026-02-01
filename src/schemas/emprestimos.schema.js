import { z } from "zod";
import { getRegistry } from "../config/openapi.js";

const registry = getRegistry();

export const EmprestimoSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  usuario_id: z.number().int().openapi({ example: 10 }),
  livro_id: z.number().int().openapi({ example: 3 }),
  data_emprestimo: z.string().openapi({ example: "2026-01-31T10:00:00.000Z" }),
  data_prevista_devolucao: z
    .string()
    .openapi({ example: "2026-02-07T10:00:00.000Z" }),
  data_devolucao: z.string().nullable().openapi({ example: null }),
  status: z.string().openapi({ example: "ativo" }),
});

export const CriarEmprestimoSchema = z.object({
  usuarioId: z.number().int().positive().openapi({ example: 10 }),
  livroId: z.number().int().positive().openapi({ example: 3 }),
});

export const EmprestimoIdParamsSchema = z.object({
  emprestimoId: z.coerce
    .number()
    .int()
    .positive()
    .openapi({
      param: { name: "emprestimoId", in: "path", required: true },
      example: 1,
    }),
});

export const ListarEmprestimosQuerySchema = z.object({
  status: z
    .enum(["ativo", "devolvido", "atrasado"])
    .optional()
    .openapi({
      param: { name: "status", in: "query" },
      example: "ativo",
    }),
  usuarioId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({
      param: { name: "usuarioId", in: "query" },
      example: 10,
    }),
  livroId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({
      param: { name: "livroId", in: "query" },
      example: 3,
    }),
});

registry.register("Emprestimo", EmprestimoSchema);
registry.register("CriarEmprestimo", CriarEmprestimoSchema);
registry.register("EmprestimoIdParams", EmprestimoIdParamsSchema);
registry.register("ListarEmprestimosQuery", ListarEmprestimosQuerySchema);
