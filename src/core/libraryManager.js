let instance;

export default function getLibraryManager(db) {
  if (instance) {
    return instance;
  }

  instance = {
    async emprestarLivro({ usuarioId, livroId }) {
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const livroResult = await client.query(
          `SELECT id, copias_disponiveis
           FROM livros
           WHERE id = $1
           FOR UPDATE`,
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
          `INSERT INTO emprestimos
           (usuario_id, livro_id, data_emprestimo, data_prevista_devolucao)
           VALUES ($1, $2, NOW(), $3)
           RETURNING *`,
          [usuarioId, livroId, dataPrevistaDevolucao],
        );

        await client.query(
          `UPDATE livros
           SET copias_disponiveis = copias_disponiveis - 1
           WHERE id = $1`,
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
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const emprestimoResult = await client.query(
          `SELECT id, livro_id, status
           FROM emprestimos
           WHERE id = $1
           FOR UPDATE`,
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
          `UPDATE emprestimos
           SET status = 'devolvido',
               data_devolucao = CURRENT_TIMESTAMP
           WHERE id = $1
           RETURNING *`,
          [emprestimoId],
        );

        await client.query(
          `UPDATE livros
           SET copias_disponiveis = copias_disponiveis + 1
           WHERE id = $1`,
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
            WHEN e.status = 'ativo'
             AND e.data_devolucao IS NULL
             AND NOW() > e.data_prevista_devolucao
            THEN 'atrasado'
            ELSE e.status
          END AS status_calculado
        FROM emprestimos e
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY e.data_emprestimo DESC
      `;

      const { rows } = await db.query(sql, values);
      return rows;
    },

    async obterEmprestimo({ emprestimoId }) {
      const { rows, rowCount } = await db.query(
        "SELECT * FROM emprestimos WHERE id = $1",
        [emprestimoId],
      );

      if (rowCount === 0) {
        throw new Error("Empréstimo não encontrado");
      }

      return rows[0];
    },

    async reservarLivro({ usuarioId, livroId }) {
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const livroResult = await client.query(
          `SELECT copias_disponiveis
           FROM livros
           WHERE id = $1
           FOR UPDATE`,
          [livroId],
        );

        if (livroResult.rowCount === 0) {
          throw new Error("Livro não encontrado");
        }

        if (livroResult.rows[0].copias_disponiveis > 0) {
          throw new Error(
            "Livro disponível para empréstimo. Reserva não permitida",
          );
        }

        const reservaExistente = await client.query(
          `SELECT id
           FROM reservas
           WHERE usuario_id = $1
             AND livro_id = $2
             AND status = 'ativa'`,
          [usuarioId, livroId],
        );

        if (reservaExistente.rowCount > 0) {
          throw new Error(
            "Usuário já possui uma reserva ativa para este livro",
          );
        }

        const reservaResult = await client.query(
          `INSERT INTO reservas
           (usuario_id, livro_id, data_expiracao, status)
           VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '3 days', 'ativa')
           RETURNING *`,
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

    async calcularDisponibilidade({ livroId }) {
      const { rows, rowCount } = await db.query(
        `SELECT copias_disponiveis FROM livros WHERE id = $1`,
        [livroId],
      );

      if (rowCount === 0) {
        throw new Error("Livro não encontrado");
      }

      const { copias_disponiveis } = rows[0];

      return {
        livroId,
        copiasDisponiveis: copias_disponiveis,
        disponivel: copias_disponiveis > 0,
      };
    },
  };

  return instance;
}
