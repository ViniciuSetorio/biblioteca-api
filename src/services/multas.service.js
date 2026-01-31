export default function createMultasService(db) {
  async function listarMultas(filters = {}) {
    let query = `
      SELECT m.*, e.usuario_id, e.livro_id
      FROM multas m
      JOIN emprestimos e ON m.emprestimos_id = e.id
      WHERE 1=1
    `;

    const params = [];
    let index = 1;

    if (filters.pago !== undefined) {
      query += ` AND m.pago = $${index++}`;
      params.push(filters.pago);
    }

    if (filters.usuarioId) {
      query += ` AND e.usuario_id = $${index++}`;
      params.push(filters.usuarioId);
    }

    query += ` ORDER BY m.created_at DESC`;

    const { rows } = await db.query(query, params);
    return rows;
  }

  async function buscarMultaPorId(id) {
    const { rows, rowCount } = await db.query(
      `
      SELECT m.*, e.usuario_id, e.livro_id
      FROM multas m
      JOIN emprestimos e ON m.emprestimos_id = e.id
      WHERE m.id = $1
      `,
      [id],
    );

    if (rowCount === 0) {
      throw NotFoundError("Multa não encontrada", "FINE_NOT_FOUND");
    }

    return rows[0];
  }

  return {
    listarMultas,
    buscarMultaPorId,
  };
}
