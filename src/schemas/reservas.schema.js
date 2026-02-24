import { z } from "zod";
import { getRegistry } from "../config/openapi.js";

const registry = getRegistry();

// Schema da reserva completa (resposta do banco)
export const ReservaSchema = z.object({
  id: z.number().int().openapi({
    example: 1,
  }),
  usuario_id: z.number().int().openapi({
    example: 1,
  }),
  usuario_nome: z.string().openapi({
    example: "João Silva",
  }),
  usuario_email: z.string().openapi({
    example: "joao.silva@email.com"
  }),
  livro_id: z.number().int().openapi({
    example: 2,
  }),
  livro_titulo: z.string().openapi({
    example: "Clean Code",
  }),
  data_reserva: z.string().openapi({
    example: "2026-01-30T22:00:00.000Z",
  }),
  data_expiracao: z.string().openapi({
    example: "2026-02-01T22:00:00.000Z",
  }),
  status: z.enum(["ativa", "cancelada", "expirada"]).openapi({
    example: "ativa",
  }),
});

// Schema para criar reserva (body do POST)
export const CriarReservaSchema = z.object({
  usuarioId: z.number().int().positive().openapi({
    example: 1,
    description: "ID do usuário que está fazendo a reserva",
  }),
  livroId: z.number().int().positive().openapi({
    example: 2,
    description: "ID do livro a ser reservado",
  }),
});

// Schema para parâmetros de rota (ID da reserva)
export const ReservaIdParamsSchema = z.object({
  reservaId: z.coerce
    .number()
    .int()
    .positive()
    .openapi({
      param: { name: "reservaId", in: "path", required: true },
      example: 1,
      description: "ID da reserva",
    }),
});

// Schema para filtros de listagem
export const ListarReservasQuerySchema = z.object({
  status: z
    .enum(["ativa", "cancelada", "expirada"])
    .optional()
    .openapi({
      param: { name: "status", in: "query" },
      example: "ativa",
      description: "Filtrar por status da reserva",
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
  livroId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({
      param: { name: "livroId", in: "query" },
      example: 2,
      description: "Filtrar por ID do livro",
    }),
});

// Registrar schemas no OpenAPI
registry.register("Reserva", ReservaSchema);
registry.register("CriarReserva", CriarReservaSchema);
registry.register("ReservaIdParams", ReservaIdParamsSchema);
registry.register("ListarReservasQuery", ListarReservasQuerySchema);
