import { pool } from "../config/database.js";

const LibraryManager = {
  async emprestarLivro({ usuarioId, livroId }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const livroResult = await client.query(
        `SELECT id, copias_disponiveis FROM livros WHERE id = $1 FOR UPDATE`,
        [livroId],
      );

      if (livroResult.rowCount === 0) {
        throw new Error("Livro não encontrado");
      }

      const livro = livroResult.rows[0];

      if (livro.copias_disponiveis <= 0) {
        throw new Error("Nenhuma cópia disponível para empréstimo");
      }

      const dataPrevistaDevolucao = new Date();
      dataPrevistaDevolucao.setDate(dataPrevistaDevolucao.getDate() + 7);

      const emprestimoResult = await client.query(
        `INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_prevista_devolucao)
        VALUES ($1, $2, NOW(), $3) RETURNING *`,
        [usuarioId, livroId, dataPrevistaDevolucao],
      );

      await client.query(
        `UPDATE livros SET copias_disponiveis = copias_disponiveis - 1 WHERE id = $1`,
        [livroId],
      );

      await client.query("COMMIT");
      return emprestimoResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async devolverLivro({ emprestimoId }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const emprestimoResult = await client.query(
        `SELECT id, livro_id, status FROM emprestimos WHERE id = $1 FOR UPDATE`,
        [emprestimoId],
      );

      if (emprestimoResult.rowCount === 0) {
        throw new Error("Empréstimo não encontrado");
      }

      const emprestimo = emprestimoResult.rows[0];

      if (emprestimo.status !== "ativo") {
        throw new Error("Empréstimo já foi finalizado");
      }

      const devolucaoResult = await client.query(
        `UPDATE emprestimos SET status = "devolvido", data_devolucao = CURRENT_TIMESTAMP WHERE id = $1 
        RETURNING *`,
        [emprestimoId],
      );

      await client.query(
        `UPDATE livros SET copias_disponiveis = copias_disponiveis + 1 WHERE id = $1`,
        [emprestimo.livro_id],
      );

      await client.query("COMMIT");
      return devolucaoResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async listarEmprestimos({ status, usuarioId, livroId } = {}) {
    const where = [];
    const values = [];
    let i = 1;

    if (status) {
      where.push(`e.status = $${i++}`);
      values.push(status);
    }
    if (usuarioId) {
      where.push(`e.usuario_id = $${i++}`);
      values.push(usuarioId);
    }
    if (livroId) {
      where.push(`e.livro_id = $${i++}`);
      values.push(livroId);
    }

    const sql = `
      SELECT
        e.*,
        CASE
          WHEN e.status = 'ativo' AND e.data_devolucao IS NULL AND NOW() > e.data_prevista_devolucao THEN 'atrasado'
          ELSE e.status
        END AS status_calculado
      FROM emprestimos e
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY e.data_emprestimo DESC
    `;

    const { rows } = await pool.query(sql, values);
    return rows;
  },

  async obterEmprestimo({ emprestimoId }) {
    const { rows, rowCount } = await pool.query(
      "SELECT * FROM emprestimos WHERE id = $1",
      [emprestimoId],
    );

    if (rowCount === 0) {
      throw new Error("Empréstimo não encontrado");
    }

    return rows[0];
  },

  async reservarLivro({ usuarioId, livroId }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const livroResult = await client.query(
        `SELECT copias_disponiveis FROM livros WHERE id = $1 FOR UPDATE`,
        [livroId],
      );

      if (livroResult.rowCount === 0) {
        throw new Error("Livro não encontrado");
      }

      const { copias_disponiveis } = livroResult.rows[0];

      if (copias_disponiveis > 0) {
        throw new Error(
          "Livro disponível para empréstimo. Reserva não permitida",
        );
      }

      const reservaExistente = await client.query(
        `SELECT id FROM reservas WHERE usuario_id = $1 AND livro_id = $2 AND status = 'ativa'`,
        [usuarioId, livroId],
      );

      if (reservaExistente.rowCount > 0) {
        throw new Error("Usuário já possui uma reserva ativa para este livro");
      }

      const reservaResult = await client.query(
        `INSERT INTO reservas (usuario_id, livro_id, data_expiracao, status) 
        VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '3 days', 'ativa') RETURNING *`,
        [usuarioId, livroId],
      );

      await client.query("COMMIT");
      return reservaResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async calcularMulta({ emprestimoId }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const emprestimoResult = await client.query(
        `SELECT id, data_prevista_devolucao, data_devolucao FROM emprestimos WHERE id = $1 FOR UPDATE`,
        [emprestimoId],
      );

      if (emprestimoResult.rowCount === 0) {
        throw new Error("Empréstimo não encontrado");
      }

      const emprestimo = emprestimoResult.rows[0];

      if (!emprestimo.data_devolucao) {
        throw new Error("Empréstimo ainda não foi devolvido");
      }

      const multaExistente = await client.query(
        `SELECT id FROM multas WHERE emprestimo_id = $1`,
        [emprestimoId],
      );

      if (multaExistente.rowCount > 0) {
        throw new Error("Multa já calculada para este empréstimo");
      }

      const atrasoMs =
        new Date(emprestimo.data_devolucao) -
        new Date(emprestimo.data_prevista_devolucao);

      if (atrasoDias <= 0) {
        await client.query("COMMIT");
        return { multa: 0 };
      }

      const diasAtraso = Math.ceil(atrasoMs / (1000 * 60 * 60 * 24));
      const valorMulta = diasAtraso * 2;

      const multaRsult = await client.query(
        `INSERT INTO multas (emprestimo_id, valor, pago) VALUES ($1, $2, false) RETURNING *`,
        [emprestimoId, valorMulta],
      );

      await client.query("COMMIT");
      return multaRsult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async calcularDisponibilidade({ livroId }) {
    const client = await pool.connect();

    const livroResult = await client.query(
      `SELECT copias_disponiveis FROM livros WHERE id = $1`,
      [livroId],
    );
    if (livroResult.rowCount === 0) {
      throw new Error("Livro não encontrado");
    }

    const { copias_disponiveis } = livroResult.rows[0];

    return {
      livroId,
      copiasDisponiveis: copias_disponiveis,
      disponivel: copias_disponiveis > 0,
    };
  },
};

export default LibraryManager;
