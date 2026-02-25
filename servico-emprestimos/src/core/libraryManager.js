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

        // Verificar se usuário existe
        const usuariosServiceUrl = process.env.USUARIOS_SERVICE_URL || 'http://servico-usuarios:3001';
        const userResponse = await fetch(`${usuariosServiceUrl}/usuarios/${usuarioId}`);
        
        if (!userResponse.ok) {
          throw NotFoundError("Usuário não encontrado", "USER_NOT_FOUND");
        }

        // Verificar disponibilidade do livro via serviço de livros
        const livrosServiceUrl = process.env.LIVROS_SERVICE_URL || 'http://servico-livros:3002';
        const livroResponse = await fetch(`${livrosServiceUrl}/livros/${livroId}`);
        
        if (!livroResponse.ok) {
          throw NotFoundError("Livro não encontrado", "BOOK_NOT_FOUND");
        }

        const livro = await livroResponse.json();

        if (livro.copias_disponiveis <= 0) {
          throw ConflictError("Nenhuma cópia disponível para empréstimo", "NO_AVAILABLE_COPIES");
        }

        const dataPrevistaDevolucao = new Date();
        dataPrevistaDevolucao.setDate(dataPrevistaDevolucao.getDate() + 7);

        const { rows } = await client.query(
          `INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_prevista_devolucao)
           VALUES ($1, $2, NOW(), $3) RETURNING *`,
          [usuarioId, livroId, dataPrevistaDevolucao],
        );

        // Atualizar cópias disponíveis via HTTP
        await fetch(`${livrosServiceUrl}/livros/${livroId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ copias_disponiveis: livro.copias_disponiveis - 1 })
        });

        await client.query("COMMIT");

        // Notificar usuário (assíncrono)
        const notificacoesServiceUrl = process.env.NOTIFICACOES_SERVICE_URL || 'http://servico-notificacoes:3005';
        fetch(`${notificacoesServiceUrl}/notificacoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'emprestimo',
            usuarioId,
            emprestimoId: rows[0].id
          })
        }).catch(err => console.error('Erro ao notificar:', err.message));

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
          `SELECT id, livro_id, status, data_prevista_devolucao FROM emprestimos WHERE id = $1 FOR UPDATE`,
          [emprestimoId],
        );

        if (rowCount === 0) {
          throw NotFoundError("Empréstimo não encontrado", "LOAN_NOT_FOUND");
        }

        const emprestimo = rows[0];

        if (emprestimo.status !== "ativo") {
          throw ConflictError("Empréstimo já foi finalizado", "LOAN_ALREADY_FINISHED");
        }

        const { rows: devolucao } = await client.query(
          `UPDATE emprestimos
           SET status = 'devolvido', data_devolucao = CURRENT_TIMESTAMP
           WHERE id = $1 RETURNING *`,
          [emprestimoId],
        );

        // Atualizar cópias disponíveis
        const livrosServiceUrl = process.env.LIVROS_SERVICE_URL || 'http://servico-livros:3002';
        const livroResponse = await fetch(`${livrosServiceUrl}/livros/${emprestimo.livro_id}`);
        
        if (livroResponse.ok) {
          const livro = await livroResponse.json();
          await fetch(`${livrosServiceUrl}/livros/${emprestimo.livro_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ copias_disponiveis: livro.copias_disponiveis + 1 })
          });
        }

        // Calcular multa se necessário
        const dataPrevista = new Date(emprestimo.data_prevista_devolucao);
        const dataDevolucao = new Date(devolucao[0].data_devolucao);
        
        if (dataDevolucao > dataPrevista) {
          const diasAtraso = Math.ceil((dataDevolucao - dataPrevista) / (1000 * 60 * 60 * 24));
          const valorMulta = diasAtraso * 2;

          const multasServiceUrl = process.env.MULTAS_SERVICE_URL || 'http://servico-multas:3004';
          fetch(`${multasServiceUrl}/multas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emprestimoId, valor: valorMulta })
          }).catch(err => console.error('Erro ao criar multa:', err.message));
        }

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

    async listarEmprestimos(filters = {}) {
      let query = `SELECT * FROM emprestimos WHERE 1=1`;
      const params = [];
      let paramIndex = 1;

      if (filters.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.usuarioId) {
        query += ` AND usuario_id = $${paramIndex}`;
        params.push(filters.usuarioId);
        paramIndex++;
      }

      if (filters.livroId) {
        query += ` AND livro_id = $${paramIndex}`;
        params.push(filters.livroId);
        paramIndex++;
      }

      query += ` ORDER BY data_emprestimo DESC`;

      const { rows } = await db.query(query, params);
      return rows;
    },

    async criarReserva({ usuarioId, livroId }) {
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        // Verificar se usuário existe
        const usuariosServiceUrl = process.env.USUARIOS_SERVICE_URL || 'http://servico-usuarios:3001';
        const userResponse = await fetch(`${usuariosServiceUrl}/usuarios/${usuarioId}`);
        if (!userResponse.ok) {
          throw NotFoundError("Usuário não encontrado", "USER_NOT_FOUND");
        }

        // Verificar livro
        const livrosServiceUrl = process.env.LIVROS_SERVICE_URL || 'http://servico-livros:3002';
        const livroResponse = await fetch(`${livrosServiceUrl}/livros/${livroId}`);
        if (!livroResponse.ok) {
          throw NotFoundError("Livro não encontrado", "BOOK_NOT_FOUND");
        }

        const dataExpiracao = new Date();
        dataExpiracao.setDate(dataExpiracao.getDate() + 2);

        const { rows } = await client.query(
          `INSERT INTO reservas (usuario_id, livro_id, data_reserva, data_expiracao, status)
           VALUES ($1, $2, NOW(), $3, 'ativa') RETURNING *`,
          [usuarioId, livroId, dataExpiracao],
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

    async cancelarReserva({ reservaId }) {
      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const { rows, rowCount } = await client.query(
          `SELECT id, status FROM reservas WHERE id = $1 FOR UPDATE`,
          [reservaId],
        );

        if (rowCount === 0) {
          throw NotFoundError("Reserva não encontrada", "RESERVATION_NOT_FOUND");
        }

        const reserva = rows[0];

        if (reserva.status !== "ativa") {
          throw ConflictError("Reserva não está ativa", "RESERVATION_NOT_ACTIVE");
        }

        const { rows: updated } = await client.query(
          `UPDATE reservas SET status = 'cancelada' WHERE id = $1 RETURNING *`,
          [reservaId],
        );

        await client.query("COMMIT");
        return updated[0];
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