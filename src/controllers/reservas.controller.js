import getDatabase from "../config/database.js";
import createReservasService from "../services/reservas.service.js";
import { createLibraryManager } from "../core/libraryManager.js";
import { InternalServerError } from "../utils/httpError.js";
import {
  CriarReservaSchema,
  ListarReservasQuerySchema,
  ReservaIdParamsSchema,
} from "../schemas/reservas.schema.js";

const db = getDatabase();
const reservasService = createReservasService(db);
const libraryManager = createLibraryManager();

async function criarReserva(req, res) {
  try {
    const body = CriarReservaSchema.parse(req.body);
    const reserva = await libraryManager.criarReserva(body);
    return res.status(201).json(reserva);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json(err);
    }

    console.error(err);
    const error = InternalServerError(
      "Erro ao criar reserva",
      "INTERNAL_ERROR",
    );
    return res.status(error.statusCode).json(error);
  }
}

async function listarReservas(req, res) {
  try {
    const filters = ListarReservasQuerySchema.parse(req.query);
    const reservas = await reservasService.listarReservas(filters);
    return res.status(200).json(reservas);
  } catch (err) {
    console.error(err);
    const error = InternalServerError(
      "Erro ao listar reservas",
      "INTERNAL_ERROR",
    );
    return res.status(error.statusCode).json(error);
  }
}

async function obterReserva(req, res) {
  try {
    const { reservaId } = ReservaIdParamsSchema.parse(req.params);
    const reserva = await reservasService.buscarReservaPorId(reservaId);
    return res.status(200).json(reserva);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json(err);
    }

    console.error(err);
    const error = InternalServerError(
      "Erro ao buscar reserva",
      "INTERNAL_ERROR",
    );
    return res.status(error.statusCode).json(error);
  }
}

async function cancelarReserva(req, res) {
  try {
    const { reservaId } = ReservaIdParamsSchema.parse(req.params);
    const reserva = await libraryManager.cancelarReserva({
      reservaId: reservaId,
    });

    return res.status(200).json(reserva);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json(err);
    }

    console.error(err);
    const error = InternalServerError(
      "Erro ao cancelar reserva",
      "INTERNAL_ERROR",
    );
    return res.status(error.statusCode).json(error);
  }
}

export default {
  criarReserva,
  listarReservas,
  obterReserva,
  cancelarReserva,
};
