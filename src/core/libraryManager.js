import getDatabase from "../config/database.js";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from "../utils/httpError.js";

let instance;

export function createLibraryManager() {
  if (instance) return instance;

  const db = getDatabase();

  instance = {
    async emprestarLivro({ usuarioId, livroId }) {
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const livroResult = await client.query(
          `SELECT id, copias_disponiveis FROM livros WHERE id = $1 FOR UPDATE`,
          [livroId],
        );

        if (livroResult.rowCount === 0) {
          throw NotFoundError("Livro não encontrado", "BOOK_NOT_FOUND");
        }

        const livro = livroResult.rows[0];

        if (livro.copias_disponiveis <= 0) {
          throw ConflictError(
            "Nenhuma cópia disponível para empréstimo",
            "NO_AVAILABLE_COPIES",
          );
        }

        const dataPrevistaDevolucao = new Date();
        dataPrevistaDevolucao.setDate(dataPrevistaDevolucao.getDate() + 7);

        const { rows } = await client.query(
          `INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_prevista_devolucao)
           VALUES ($1, $2, NOW(), $3) RETURNING *`,
          [usuarioId, livroId, dataPrevistaDevolucao],
        );

        await client.query(
          `UPDATE livros SET copias_disponiveis = copias_disponiveis - 1 WHERE id = $1`,
          [livroId],
        );

        await client.query("COMMIT");
        return rows[0];
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

        const { rows, rowCount } = await client.query(
          `SELECT id, livro_id, status FROM emprestimos WHERE id = $1 FOR UPDATE`,
          [emprestimoId],
        );

        if (rowCount === 0) {
          throw NotFoundError("Empréstimo não encontrado", "LOAN_NOT_FOUND");
        }

        const emprestimo = rows[0];

        if (emprestimo.status !== "ativo") {
          throw ConflictError(
            "Empréstimo já foi finalizado",
            "LOAN_ALREADY_FINISHED",
          );
        }

        const { rows: devolucao } = await client.query(
          `UPDATE emprestimos
           SET status = 'devolvido', data_devolucao = CURRENT_TIMESTAMP
           WHERE id = $1 RETURNING *`,
          [emprestimoId],
        );

        await client.query(
          `UPDATE livros SET copias_disponiveis = copias_disponiveis + 1 WHERE id = $1`,
          [emprestimo.livro_id],
        );

        await client.query("COMMIT");
        return devolucao[0];
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    async obterEmprestimo({ emprestimoId }) {
      const { rows, rowCount } = await db.query(
        `SELECT * FROM emprestimos WHERE id = $1`,
        [emprestimoId],
      );

      if (rowCount === 0) {
        throw NotFoundError("Empréstimo não encontrado", "LOAN_NOT_FOUND");
      }

      return rows[0];
    },

    async calcularMulta({ emprestimoId }) {
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const { rows, rowCount } = await client.query(
          `SELECT data_prevista_devolucao, data_devolucao
           FROM emprestimos WHERE id = $1 FOR UPDATE`,
          [emprestimoId],
        );

        if (rowCount === 0) {
          throw NotFoundError("Empréstimo não encontrado", "LOAN_NOT_FOUND");
        }

        const emprestimo = rows[0];

        if (!emprestimo.data_devolucao) {
          throw UnprocessableEntityError(
            "Empréstimo ainda não foi devolvido",
            "LOAN_NOT_RETURNED",
          );
        }

        const atrasoMs =
          new Date(emprestimo.data_devolucao) -
          new Date(emprestimo.data_prevista_devolucao);

        if (atrasoMs <= 0) {
          await client.query("COMMIT");
          return { multa: 0 };
        }

        const diasAtraso = Math.ceil(atrasoMs / (1000 * 60 * 60 * 24));
        const valorMulta = diasAtraso * 2;

        const { rows: multa } = await client.query(
          `INSERT INTO multas (emprestimo_id, valor, pago)
           VALUES ($1, $2, false) RETURNING *`,
          [emprestimoId, valorMulta],
        );

        await client.query("COMMIT");
        return multa[0];
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };

  return instance;
}
