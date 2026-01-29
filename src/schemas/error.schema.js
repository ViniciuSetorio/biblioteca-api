import { z } from "zod";

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      example: "BOOK_NOT_FOUND",
    }),
    message: z.string().openapi({
      example: "Livro não encontrado"
    }),
  }),
});
