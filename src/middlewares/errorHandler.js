import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  // Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Erro de validação",
      code: "VALIDATION_ERROR",
      issues: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Erros da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  }

  // Erro inesperado
  console.error(err);
  return res.status(500).json({
    message: "Erro interno do servidor",
    code: "INTERNAL_SERVER_ERROR",
  });
}
