import { z } from "zod";
import { getRegistry } from "../config/openapi.js";

const registry = getRegistry();

// Schema da multa completa (resposta do banco com JOIN)
export const MultaSchema = z.object({
  id: z.number().int().openapi({
    example: 1,
  }),
  emprestimos_id: z.number().int().openapi({
    example: 5,
    description: "ID do empréstimo que gerou a multa",
  }),
  valor: z.number().openapi({
    example: 20.00,
    description: "Valor da multa em reais (R$ 2,00 por dia de atraso)",
  }),
  pago: z.boolean().openapi({
    example: false,
    description: "Indica se a multa foi paga",
  }),
  data_pagamento: z.string().nullable().openapi({
    example: null,
    description: "Data e hora do pagamento (null se não foi paga)",
  }),
  created_at: z.string().openapi({
    example: "2026-01-30T22:00:00.000Z",
    description: "Data e hora de criação da multa",
  }),
  usuario_id: z.number().int().openapi({
    example: 1,
    description: "ID do usuário que deve pagar a multa",
  }),
  livro_id: z.number().int().openapi({
    example: 2,
    description: "ID do livro relacionado ao empréstimo",
  }),
});

// Schema para parâmetros de rota (ID da multa)
export const MultaIdParamsSchema = z.object({
  multaId: z.coerce
    .number()
    .int()
    .positive()
    .openapi({
      param: { name: "multaId", in: "path", required: true },
      example: 1,
      description: "ID da multa",
    }),
});

// Schema para filtros de listagem
export const ListarMultasQuerySchema = z.object({
  pago: z.coerce
    .boolean()
    .optional()
    .openapi({
      param: { name: "pago", in: "query" },
      example: false,
      description: "Filtrar por status de pagamento",
    }),
  usuarioId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({
      param: { name: "usuarioId", in: "query" },
      example: 1,
      description: "Filtrar por ID do usuário",
    }),
});

// Registrar schemas no OpenAPI
registry.register("Multa", MultaSchema);
registry.register("MultaIdParams", MultaIdParamsSchema);
registry.register("ListarMultasQuery", ListarMultasQuerySchema);
