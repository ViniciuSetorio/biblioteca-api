import { z } from "zod";
import { getRegistry } from "../config/openapi.js";

const registry = getRegistry();

export const ErrorResponseSchema = z.object({
  message: z.string().openapi({
    example: "Não encontrado",
  }),
  code: z.string().openapi({
    example: "NOT_FOUND",
  }),
});

export const ValidationErrorSchema = z.object({
  message: z.literal("Erro de validação"),
  code: z.literal("VALIDATION_ERROR"),
  issues: z.array(
    z.object({
      path: z.string().openapi({ example: "body.usuarioId" }),
      message: z.string().openapi({ example: "Required" }),
    }),
  ),
});

export const InternalError = z.object({
  message: z.string().openapi({
    example: "Erro interno no servidor",
  }),
  code: z.string().openapi({
    example: "INTERNAL_ERROR",
  }),
});

registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("ValidateError", ValidationErrorSchema);
registry.register("InternalError", InternalError);