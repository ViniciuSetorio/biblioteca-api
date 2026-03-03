import getDatabase from "../config/database.js";
import createMultasService from "../services/multas.service.js";
import { InternalServerError } from "../utils/httpError.js";
import { z } from "zod";

const db = getDatabase();
const multasService = createMultasService(db);

const ListarMultasQuerySchema = z.object({
  pago: z.coerce.boolean().optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
});

const MultaIdParamsSchema = z.object({
  multaId: z.coerce.number().int().positive(),
});

const CriarMultaSchema = z.object({
  emprestimoId: z.number().int().positive(),
  valor: z.number().positive(),
});

async function listarMultas(req, res) {
  try {
    const filters = ListarMultasQuerySchema.parse(req.query);
    const multas = await multasService.listarMultas(filters);
    return res.status(200).json(multas);
  } catch (err) {
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, code: err.code });
    }
    if (err.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Dados inválidos", details: err.errors });
    }
    console.error(err);
    const error = InternalServerError("Erro ao listar multas", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function obterMulta(req, res) {
  try {
    const { multaId } = MultaIdParamsSchema.parse(req.params);
    const multa = await multasService.buscarMultaPorId(multaId);
    return res.status(200).json(multa);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    if (err.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "ID de multa inválido", details: err.errors });
    }
    console.error(err);
    const error = InternalServerError("Erro ao buscar multa", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function criarMulta(req, res) {
  try {
    const data = CriarMultaSchema.parse(req.body);
    const multa = await multasService.criarMulta(data);
    return res.status(201).json(multa);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    if (err.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Dados da multa inválidos", details: err.errors });
    }
    console.error(err);
    const error = InternalServerError("Erro ao criar multa", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function pagarMulta(req, res) {
  try {
    const { multaId } = MultaIdParamsSchema.parse(req.params);
    const multa = await multasService.pagarMulta(multaId);
    return res.status(200).json(multa);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    if (err.name === "ZodError") {
      return res
        .status(400)
        .json({
          message: "ID de multa inválido para pagamento",
          details: err.errors,
        });
    }
    console.error(err);
    const error = InternalServerError("Erro ao pagar multa", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

export default {
  listarMultas,
  obterMulta,
  criarMulta,
  pagarMulta,
};