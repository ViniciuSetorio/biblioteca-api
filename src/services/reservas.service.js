import { NotFoundError } from "../utils/httpError.js";

export default function createReservasService(db) {
  return {
    async listarReservas(filters = {}) {
      let query = `SELECT * FROM reservas WHERE 1=1`;
      const params = [];
      let index = 1;

      if (filters.status) {
        query += ` AND status = $${index++}`;
        params.push(filters.status);
      }

      if (filters.usuarioId) {
        query += ` AND usuario_id = $${index++}`;
        params.push(filters.usuarioId);
      }

      if (filters.livroId) {
        query += ` AND livro_id = $${index++}`;
        params.push(filters.livroId);
      }

      query += ` ORDER BY data_reserva DESC`;

      const { rows } = await db.query(query, params);
      return rows;
    },

    async buscarReservaPorId(reservaId) {
      const { rows, rowCount } = await db.query(
        `SELECT * FROM reservas WHERE id = $1`,
        [reservaId],
      );

      if (rowCount === 0) {
        throw NotFoundError("Reserva não encontrada", "RESERVATION_NOT_FOUND");
      }

      return rows[0];
    },
  };
}
