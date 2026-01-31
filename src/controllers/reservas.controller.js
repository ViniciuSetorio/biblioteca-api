import getDatabase from "../config/database.js";
import createReservasService from "../services/reservas.service.js";
import { createLibraryManager } from "../core/libraryManager.js";
import { InternalServerError } from "../utils/httpError.js";

const db = getDatabase();
const reservasService = createReservasService(db);
const libraryManager = createLibraryManager();

async function criarReserva(req, res) {
  try {
    const reserva = await libraryManager.criarReserva(req.body);
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
    const reservas = await reservasService.listarReservas(req.query);
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
    const reserva = await reservasService.buscarReservaPorId(
      Number(req.params.reservaId),
    );
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
    const reserva = await libraryManager.cancelarReserva({
      reservaId: Number(req.params.reservaId),
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
