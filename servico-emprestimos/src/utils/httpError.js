export class AppError extends Error {
  constructor({ message, statusCode = 500, code }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const NotFoundError = (message, code = "NOT_FOUND") =>
  new AppError({ message, statusCode: 404, code });

export const BadRequestError = (message, code = "BAD_REQUEST") =>
  new AppError({ message, statusCode: 400, code });

export const ConflictError = (message, code = "CONFLICT") =>
  new AppError({ message, statusCode: 409, code });

export const UnprocessableEntityError = (message, code = "UNPROCESSABLE_ENTITY") =>
  new AppError({ message, statusCode: 422, code });

export const InternalServerError = (message, code = "INTERNAL_ERROR") =>
  new AppError({ message, statusCode: 500, code });