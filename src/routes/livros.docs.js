import { z } from "zod";
import { getRegistry } from "../config/openapi.js";
import {
  LivroSchema,
  CriarLivroSchema,
  AtualizarLivroSchema,
} from "../schemas/livros.schema.js";
import {
  ErrorResponseSchema,
  InternalError,
  ValidationErrorSchema,
} from "../schemas/error.schema.js";

const registry = getRegistry();

registry.registerPath({
  method: "get",
  path: "/livros",
  description: "Lista todos os livros do catálogo",
  summary: "Listar livros",
  tags: ["Livros"],
  responses: {
    200: {
      description: "Lista de livros",
      content: {
        "application/json": {
          schema: z.array(LivroSchema),
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

registry.registerPath({
  method: "get",
  path: "/livros/{id}",
  summary: "Buscar livro por ID",
  description: "Retorna os dados de um livro específico pelo seu ID",
  tags: ["Livros"],
  request: {
    params: z.object({
      id: z.number().openapi({
        description: "ID do livro",
        example: "1",
      }),
    }),
  },
  responses: {
    200: {
      description: "Livro encontrado",
      content: {
        "application/json": {
          schema: LivroSchema,
        },
      },
    },
    404: {
      description: "Livro não encontrado",
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

registry.registerPath({
  method: "post",
  path: "/livros",
  summary: "Cadastrar novo livro",
  description: "Cria um novo livro no catálogo da biblioteca",
  tags: ["Livros"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CriarLivroSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Livro criado com sucesso",
      content: {
        "application/json": {
          schema: LivroSchema,
        },
      },
    },
    400: {
      description: "Dados inválidos",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          examples: {
            creatorNotFound: {
              value: {
                message: "Usuário criador não encontrado",
                code: "CREATOR_NOT_FOUND",
              },
            },
          },
        },
      },
    },
    422: {
      description: "Regra de negócio violada",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
          examples: {
            creatorNotFound: {
              value: {
                message: "Usuário criador não encontrado",
                code: "CREATOR_NOT_FOUND",
              },
            },
            insufficientRole: {
              value: {
                message: "Apenas bibliotecários podem cadastrar livros",
                code: "INSUFFICIENT_ROLE",
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

registry.registerPath({
  method: "put",
  path: "/livros/{id}",
  description: "Atualiza os dados de um livro",
  summary: "Atualizar livro",
  tags: ["Livros"],
  request: {
    params: z.object({
      id: z.number().openapi({
        description: "ID do livro",
        example: "1",
      }),
    }),
    body: {
      content: {
        "application/json": {
          schema: AtualizarLivroSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Livro atualizado com sucesso",
      content: {
        "application/json": {
          schema: LivroSchema,
        },
      },
    },
    404: {
      description: "Livro não encontrado",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    422: {
      description: "Regra de negócio violada",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
          examples: {
            creatorNotFound: {
              value: {
                message: "Usuário criador não encontrado",
                code: "CREATOR_NOT_FOUND",
              },
            },
            insufficientRole: {
              value: {
                message:
                  "Apenas bibliotecários podem ser definidos como criador do livro",
                code: "INSUFFICIENT_ROLE",
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

registry.registerPath({
  method: "delete",
  path: "/livros/{id}",
  summary: "Remover livro",
  description: "Remove um livro do catálogo pelo ID",
  tags: ["Livros"],
  request: {
    params: z.object({
      id: z.number().openapi({
        description: "ID do livro",
        example: "1",
      }),
    }),
  },
  responses: {
    200: {
      description: "Livro removido com sucesso",
      content: {
        "application/json": {
          schema: LivroSchema,
        },
      },
    },
    404: {
      description: "Livro não encontrado",
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
