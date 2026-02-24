import { z } from "zod";
import { getRegistry } from "../config/openapi.js";
import {
  ReservaSchema,
  CriarReservaSchema,
  ReservaIdParamsSchema,
  ListarReservasQuerySchema,
} from "../schemas/reservas.schema.js";
import {
  ErrorResponseSchema,
  InternalError,
} from "../schemas/error.schema.js";

const registry = getRegistry();

// POST /reservas - Criar nova reserva
registry.registerPath({
  method: "post",
  path: "/reservas",
  summary: "Criar nova reserva",
  description: "Cria uma nova reserva de livro para um usuário. A reserva expira em 2 dias.",
  tags: ["Reservas"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CriarReservaSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Reserva criada com sucesso",
      content: {
        "application/json": {
          schema: ReservaSchema,
        },
      },
    },
    400: {
      description: "Erro de validação",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            validationError: {
              value: {
                error: "Dados inválidos fornecidos",
              },
            },
          },
        },
      },
    },
    404: {
      description: "Livro não encontrado",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            bookNotFound: {
              value: {
                error: "Livro não encontrado",
              },
            },
          },
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: InternalError,
        },
      },
    },
  },
});

// GET /reservas - Listar reservas
registry.registerPath({
  method: "get",
  path: "/reservas",
  summary: "Listar reservas",
  description: "Lista todas as reservas com filtros opcionais por status, usuário ou livro",
  tags: ["Reservas"],
  request: {
    query: ListarReservasQuerySchema,
  },
  responses: {
    200: {
      description: "Lista de reservas",
      content: {
        "application/json": {
          schema: z.array(ReservaSchema),
        },
      },
    },
    400: {
      description: "Erro de validação nos parâmetros",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: InternalError,
        },
      },
    },
  },
});

// GET /reservas/:reservaId - Obter reserva específica
registry.registerPath({
  method: "get",
  path: "/reservas/{reservaId}",
  summary: "Obter reserva específica",
  description: "Retorna os detalhes de uma reserva pelo seu ID",
  tags: ["Reservas"],
  request: {
    params: ReservaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Reserva encontrada",
      content: {
        "application/json": {
          schema: ReservaSchema,
        },
      },
    },
    404: {
      description: "Reserva não encontrada",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            reservationNotFound: {
              value: {
                error: "Reserva não encontrada",
              },
            },
          },
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: InternalError,
        },
      },
    },
  },
});

// PATCH /reservas/:reservaId/cancelar - Cancelar reserva
registry.registerPath({
  method: "patch",
  path: "/reservas/{reservaId}/cancelar",
  summary: "Cancelar reserva",
  description: "Cancela uma reserva ativa. Apenas reservas com status 'ativa' podem ser canceladas.",
  tags: ["Reservas"],
  request: {
    params: ReservaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Reserva cancelada com sucesso",
      content: {
        "application/json": {
          schema: ReservaSchema,
        },
      },
    },
    400: {
      description: "Reserva não está ativa",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            notActive: {
              value: {
                error: "Reserva não está ativa",
              },
            },
          },
        },
      },
    },
    404: {
      description: "Reserva não encontrada",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            reservationNotFound: {
              value: {
                error: "Reserva não encontrada",
              },
            },
          },
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: InternalError,
        },
      },
    },
  },
});
