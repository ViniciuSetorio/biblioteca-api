import { z } from "zod";
import { getRegistry } from "../config/openapi.js";
import {
  MultaSchema,
  MultaIdParamsSchema,
  ListarMultasQuerySchema,
} from "../schemas/multas.schema.js";
import {
  ErrorResponseSchema,
  InternalError,
} from "../schemas/error.schema.js";

const registry = getRegistry();

// GET /multas - Listar multas
registry.registerPath({
  method: "get",
  path: "/multas",
  summary: "Listar multas",
  description: "Lista todas as multas com filtros opcionais por status de pagamento e usuário. Inclui informações do empréstimo relacionado.",
  tags: ["Multas"],
  request: {
    query: ListarMultasQuerySchema,
  },
  responses: {
    200: {
      description: "Lista de multas",
      content: {
        "application/json": {
          schema: z.array(MultaSchema),
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

// GET /multas/:multaId - Obter multa específica
registry.registerPath({
  method: "get",
  path: "/multas/{multaId}",
  summary: "Obter multa específica",
  description: "Retorna os detalhes de uma multa pelo seu ID, incluindo informações do usuário e livro relacionados",
  tags: ["Multas"],
  request: {
    params: MultaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Multa encontrada",
      content: {
        "application/json": {
          schema: MultaSchema,
        },
      },
    },
    404: {
      description: "Multa não encontrada",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            fineNotFound: {
              value: {
                error: "Multa não encontrada",
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

// PATCH /multas/:multaId/pagar - Pagar multa
registry.registerPath({
  method: "patch",
  path: "/multas/{multaId}/pagar",
  summary: "Pagar multa",
  description: "Registra o pagamento de uma multa. Define pago=true e registra a data do pagamento. Não permite pagar multas já pagas.",
  tags: ["Multas"],
  request: {
    params: MultaIdParamsSchema,
  },
  responses: {
    200: {
      description: "Multa paga com sucesso",
      content: {
        "application/json": {
          schema: MultaSchema,
        },
      },
    },
    400: {
      description: "Multa já foi paga",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            alreadyPaid: {
              value: {
                error: "Multa já foi paga",
              },
            },
          },
        },
      },
    },
    404: {
      description: "Multa não encontrada",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            fineNotFound: {
              value: {
                error: "Multa não encontrada",
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
