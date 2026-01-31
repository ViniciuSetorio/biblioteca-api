import getDatabase from "../config/database.js";
import createMultasService from "../services/multas.service.js";
import { createLibraryManager } from "../core/libraryManager.js";
import { InternalServerError } from "../utils/httpError.js";
import {
  ListarMultasQuerySchema,
  MultaIdParamsSchema,
} from "../schemas/multas.schema.js";

const db = getDatabase();
const multasService = createMultasService(db);
const libraryManager = createLibraryManager();

async function listarMultas(req, res) {
  try {
    const filters = ListarMultasQuerySchema.parse(req.query);
    const multas = await multasService.listarMultas(filters);
    return res.status(200).json(multas);
  } catch (err) {
    console.error(err);
    const error = InternalServerError(
      "Erro ao listar multas",
      "INTERNAL_ERROR",
    );
    return res.status(error.statusCode).json(error);
  }
}

async function obterMulta(req, res) {
  try {
    const { multaId } = MultaIdParamsSchema.parse(req.params);
    const multa = await multasService.buscarMultaPorId(multaId);

    return res.status(200).json(multa);
  } catch (err) {
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });
    }

    console.error(err);
    const error = InternalServerError("Erro ao buscar multa", "INTERNAL_ERROR");
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  }
}

async function calcularMulta(req, res) {
  try {
    const multa = await libraryManager.calcularMulta({
      emprestimoId: Number(req.params.emprestimoId),
    });

    return res.status(201).json(multa);
  } catch (err) {
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });
    }

    console.error(err);
    const error = InternalServerError(
      "Erro ao calcular multa",
      "INTERNAL_ERROR",
    );
    return res.status(error.statusCode).json(error);
  }
}

async function pagarMulta(req, res) {
  try {  
    const { multaId } = MultaIdParamsSchema.parse(req.params);  
    const multa = await libraryManager.quitarMulta(multaId);

    return res.status(200).json(multa);
  } catch (err) {
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });
    }

    console.error(err);
    const error = InternalServerError("Erro ao pagar multa", "INTERNAL_ERROR");
    return res.status(error.statusCode).json(error);
  }
}

export default {
  listarMultas,
  obterMulta,
  calcularMulta,
  pagarMulta,
};
