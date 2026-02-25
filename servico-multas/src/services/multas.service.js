import { NotFoundError, ConflictError } from "../utils/httpError.js";

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
      `SELECT m.*, e.usuario_id, e.livro_id
       FROM multas m
       JOIN emprestimos e ON m.emprestimos_id = e.id
       WHERE m.id = $1`,
      [id],
    );

    if (rowCount === 0) {
      throw NotFoundError("Multa não encontrada", "FINE_NOT_FOUND");
    }

    return rows[0];
  }

  async function criarMulta(data) {
    const { emprestimoId, valor } = data;
    
    // Verificar se empréstimo existe (opcional, não falha se serviço estiver fora)
    try {
      const emprestimosServiceUrl = process.env.EMPRESTIMOS_SERVICE_URL || 'http://servico-emprestimos:3003';
      await fetch(`${emprestimosServiceUrl}/emprestimos/${emprestimoId}`);
    } catch (error) {
      console.warn(`Serviço de empréstimos indisponível, criando multa para empréstimo ${emprestimoId}`);
    }
    
    const { rows } = await db.query(
      `INSERT INTO multas (emprestimos_id, valor, pago)
       VALUES ($1, $2, false)
       RETURNING *`,
      [emprestimoId, valor],
    );

    return rows[0];
  }

  async function pagarMulta(multaId) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const { rows, rowCount } = await client.query(
        `SELECT id, pago FROM multas WHERE id = $1 FOR UPDATE`,
        [multaId],
      );

      if (rowCount === 0) {
        throw NotFoundError("Multa não encontrada", "FINE_NOT_FOUND");
      }

      const multa = rows[0];

      if (multa.pago) {
        throw ConflictError("Multa já foi paga", "FINE_ALREADY_PAID");
      }

      const { rows: updated } = await client.query(
        `UPDATE multas 
         SET pago = true, data_pagamento = CURRENT_TIMESTAMP 
         WHERE id = $1 RETURNING *`,
        [multaId],
      );

      await client.query("COMMIT");
      return updated[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    listarMultas,
    buscarMultaPorId,
    criarMulta,
    pagarMulta,
  };
}