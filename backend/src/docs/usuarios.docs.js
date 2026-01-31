import { z } from "zod";
import { getRegistry } from "../config/openapi.js";
import {
  UsuarioCreateSchema,
  UsuarioSchema,
  UsuarioUpdateSchema,
} from "../schemas/usuarios.schema.js";
import {
  ErrorResponseSchema,
  InternalError,
  ValidationErrorSchema,
} from "../schemas/error.schema.js";

const registry = getRegistry();

registry.registerPath({
  method: "get",
  path: "/usuarios",
  tags: ["Usuários"],
  summary: "Listar usuários",
  description: "Retorna a lista de todos os usuários cadastrados no sistema.",
  responses: {
    200: {
      description: "Lista de usuários",
      content: {
        "application/json": {
          schema: z.array(UsuarioSchema),
        },
      },
    },
    500: {
      description: "Erro interno",
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
  path: "/usuarios/{id}",
  tags: ["Usuários"],
  summary: "Buscar usuário por ID",
  description: "Retorna os dados de um usuário específico.",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({
        example: 1,
        description: "ID do usuário",
      }),
    }),
  },
  responses: {
    200: {
      description: "Usuário encontrado",
      content: {
        "application/json": {
          schema: UsuarioSchema,
        },
      },
    },
    404: {
      description: "Usuário não encontrado",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Erro interno",
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
  path: "/usuarios",
  tags: ["Usuários"],
  summary: "Criar usuário",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UsuarioCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Usuário criado com sucesso",
      content: {
        "application/json": {
          schema: UsuarioSchema,
        },
      },
    },
    409: {
      description: "Email já cadastrado",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    422: {
      description: "Cargo inválido",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno",
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
  path: "/usuarios/{id}",
  tags: ["Usuários"],
  summary: "Atualizar usuário",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({
        example: 1,
        description: "ID do usuário",
      }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UsuarioUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Usuário atualizado",
      content: {
        "application/json": {
          schema: UsuarioSchema,
        },
      },
    },
    404: {
      description: "Usuário não encontrado",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Email já cadastrado",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
        },
      },
    },
    422: {
      description: "Cargo inválido",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno",
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
  path: "/usuarios/{id}",
  tags: ["Usuários"],
  summary: "Remover usuário",
  description:
    "Remove um usuário. Não é permitido remover usuários com empréstimos ativos.",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({
        example: 1,
        description: "ID do usuário",
      }),
    }),
  },
  responses: {
    200: {
      description: "Usuário removido com sucesso",
      content: {
        "application/json": {
          schema: UsuarioSchema,
        },
      },
    },
    404: {
      description: "Usuário não encontrado",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Usuário possui empréstimos ativos",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno",
      content: {
        "application/json": {
          schema: InternalError,
        },
      },
    },
  },
});
