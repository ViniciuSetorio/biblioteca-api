import { z } from "zod";
import { getRegistry } from "../config/openapi.js";
import {
  EmprestimoSchema,
  CriarEmprestimoSchema,
  EmprestimoIdParamsSchema,
  ListarEmprestimosQuerySchema,
} from "../schemas/emprestimos.schema.js";
import { ErrorResponseSchema, InternalError } from "../schemas/error.schema.js";

const registry = getRegistry();

/** POST /emprestimos */
registry.registerPath({
  method: "post",
  path: "/emprestimos",
  summary: "Criar empréstimo",
  description: "Cria um empréstimo de um livro para um usuário.",
  tags: ["Empréstimos"],
  request: {
    body: {
      content: {
        "application/json": { schema: CriarEmprestimoSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Empréstimo criado",
      content: { "application/json": { schema: EmprestimoSchema } },
    },
    400: {
      description: "Erro",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Erro interno",
      content: { "application/json": { schema: InternalError } },
    },
  },
});

/** PATCH /emprestimos/{emprestimoId}/devolucao */
registry.registerPath({
  method: "patch",
  path: "/emprestimos/{emprestimoId}/devolucao",
  summary: "Registrar devolução",
  description: "Registra a devolução de um empréstimo.",
  tags: ["Empréstimos"],
  request: {
    params: EmprestimoIdParamsSchema,
  },
  responses: {
    200: {
      description: "Devolução registrada",
      content: { "application/json": { schema: EmprestimoSchema } },
    },
    400: {
      description: "Erro",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Erro interno",
      content: { "application/json": { schema: InternalError } },
    },
  },
});

/** GET /emprestimos */
registry.registerPath({
  method: "get",
  path: "/emprestimos",
  summary: "Listar empréstimos",
  description: "Lista empréstimos com filtros opcionais.",
  tags: ["Empréstimos"],
  request: {
    query: ListarEmprestimosQuerySchema,
  },
  responses: {
    200: {
      description: "Lista de empréstimos",
      content: {
        "application/json": { schema: z.array(EmprestimoSchema) },
      },
    },
    400: {
      description: "Erro",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Erro interno",
      content: { "application/json": { schema: InternalError } },
    },
  },
});

/** GET /emprestimos/{emprestimoId} */
registry.registerPath({
  method: "get",
  path: "/emprestimos/{emprestimoId}",
  summary: "Buscar empréstimo por ID",
  description: "Retorna os dados de um empréstimo específico pelo ID.",
  tags: ["Empréstimos"],
  request: {
    params: EmprestimoIdParamsSchema,
  },
  responses: {
    200: {
      description: "Empréstimo encontrado",
      content: { "application/json": { schema: EmprestimoSchema } },
    },
    400: {
      description: "Erro",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Erro interno",
      content: { "application/json": { schema: InternalError } },
    },
  },
});
