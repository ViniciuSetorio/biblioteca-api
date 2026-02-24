import { NotFoundError } from "../utils/httpError.js";

export default function createReservasService(db) {
  return {
    async listarReservas(filters = {}) {
      let query = `
        SELECT r.*, u.nome as usuario_nome, u.email as usuario_email, l.titulo as livro_titulo
        FROM reservas r
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN livros l ON r.livro_id = l.id
        WHERE 1=1
      `;
      const params = [];
      let index = 1;

      if (filters.status) {
        query += ` AND r.status = $${index++}`;
        params.push(filters.status);
      }

      if (filters.usuarioId) {
        query += ` AND r.usuario_id = $${index++}`;
        params.push(filters.usuarioId);
      }

      if (filters.livroId) {
        query += ` AND r.livro_id = $${index++}`;
        params.push(filters.livroId);
      }

      query += ` ORDER BY r.data_reserva DESC`;

      const { rows } = await db.query(query, params);
      return rows;
    },

    async buscarReservaPorId(reservaId) {
      const { rows, rowCount } = await db.query(
        `
        SELECT r.*, u.nome as usuario_nome, u.email as usuario_email, l.titulo as livro_titulo
        FROM reservas r
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN livros l ON r.livro_id = l.id
        WHERE r.id = $1
        `,
        [reservaId],
      );

      if (rowCount === 0) {
        throw NotFoundError("Reserva não encontrada", "RESERVATION_NOT_FOUND");
      }

      return rows[0];
    },
  };
}
