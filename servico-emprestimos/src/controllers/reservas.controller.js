import { createLibraryManager } from "../core/libraryManager.js";
import { InternalServerError } from "../utils/httpError.js";
import { z } from "zod";
import createReservasService from "../services/reservas.service.js";

const normalizeKeysToCamel = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    result[camelKey] = value;
  }
  return result;
};

const CriarReservaSchema = z.preprocess(
  (data) => normalizeKeysToCamel(data),
  z.object({
    usuarioId: z.number().int().positive(),
    livroId: z.number().int().positive(),
  }),
);

const ReservaIdParamsSchema = z.object({
  reservaId: z.coerce.number().int().positive(),
});

const ListarReservasQuerySchema = z.preprocess(
  (data) => normalizeKeysToCamel(data),
  z.object({
    status: z.enum(["ativa", "cancelada", "expirada"]).optional(),
    usuarioId: z.coerce.number().int().positive().optional(),
    livroId: z.coerce.number().int().positive().optional(),
  }),
);

function getLibraryManager(req) {
  const db = req.app.locals.db;
  return createLibraryManager(db);
}

function getReservasService(req) {
  const db = req.app.locals.db;
  return createReservasService(db);
}

async function criarReserva(req, res) {
  try {
    const data = CriarReservaSchema.parse(req.body);
    const libraryManager = getLibraryManager(req);
    const reserva = await libraryManager.criarReserva(data);
    return res.status(201).json(reserva);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao criar reserva", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function listarReservas(req, res) {
  try {
    const filters = ListarReservasQuerySchema.parse(req.query);
    const reservasService = getReservasService(req);
    const reservas = await reservasService.listarReservas(filters);
    return res.status(200).json(reservas);
  } catch (err) {
    console.error(err);
    const error = InternalServerError("Erro ao listar reservas", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function obterReserva(req, res) {
  try {
    const { reservaId } = ReservaIdParamsSchema.parse(req.params);
    const reservasService = getReservasService(req);
    const reserva = await reservasService.buscarReservaPorId(reservaId);
    return res.status(200).json(reserva);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao buscar reserva", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

async function cancelarReserva(req, res) {
  try {
    const { reservaId } = ReservaIdParamsSchema.parse(req.params);
    const libraryManager = getLibraryManager(req);
    const reserva = await libraryManager.cancelarReserva({ reservaId });
    return res.status(200).json(reserva);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code });
    }
    console.error(err);
    const error = InternalServerError("Erro ao cancelar reserva", "INTERNAL_ERROR");
    return res.status(500).json({ message: error.message, code: error.code });
  }
}

export default {
  criarReserva,
  listarReservas,
  obterReserva,
  cancelarReserva,
};
