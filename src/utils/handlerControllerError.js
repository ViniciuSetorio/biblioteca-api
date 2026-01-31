import { InternalServerError } from "./httpError.js";

export default function handlerControllerError(res, err, fallbackMessage) {
  if (err.status && err.body) {
    return res.status(err.status).json(err.body);
  }

  console.error(err);
  const error = InternalServerError(500, "INTERNAL_ERROR", fallbackMessage);
  return res.status(error.status).json(error.body);
}
