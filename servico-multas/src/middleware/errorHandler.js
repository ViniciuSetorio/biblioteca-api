import { AppError } from "..//utils/httpError.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  }

  console.error(err);
  return res.status(500).json({
    message: "Erro interno do servidor",
    code: "INTERNAL_SERVER_ERROR",
  });
}