import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../utils/httpError.js";

export default function createUsuariosService(db) {
  async function buscarUsuarios() {
    const { rows } = await db.query(
      `
        SELECT id, nome, email, cargo, created_at
        FROM usuarios
        ORDER BY nome
        `,
    );
    return rows;
  }

  async function buscarUsuarioPorId(id) {
    const { rows, rowCount } = await db.query(
      `
        SELECT id, nome, email, cargo, created_at
        FROM usuarios
        WHERE id = $1
        `,
      [id],
    );

    if (rowCount === 0) return null;
    return rows[0];
  }

  async function criarUsuario({ nome, email, cargo }) {
    try {
      const { rows } = await db.query(
        `
          INSERT INTO usuarios (nome, email, cargo)
          VALUES ($1, $2, $3)
          RETURNING id, nome, email, cargo, created_at
          `,
        [nome, email, cargo],
      );

      return rows[0];
    } catch (error) {
      // email duplicado (unique constraint)
      if (error.code === "23505") {
        throw ConflictError("Email já cadastrado", "EMAIL_ALREADY_EXISTS");
      }
      
      if (cargo && !["bibliotecario", "membro"].includes(cargo)) {
        throw UnprocessableEntityError("Cargo inválido", "INVALID_ROLE");
      }

      throw error;
    }
  }

  async function modificarUsuario(id, data) {
    const usuarioAtual = await this.buscarUsuarioPorId(id);

    if (!usuarioAtual) {
      throw NotFoundError("Usuário não encontrado", "USER_NOT_FOUND");
    }

    if (data.cargo && !["bibliotecario", "membro"].includes(data.cargo)) {
      throw UnprocessableEntityError("Cargo inválido", "INVALID_ROLE");
    }

    const campos = [];
    const valores = [];
    let i = 1;

    for (const key of ["nome", "email", "cargo"]) {
      if (data[key] !== undefined) {
        campos.push(`${key} = $${i++}`);
        valores.push(data[key]);
      }
    }

    if (campos.length === 0) {
      return usuarioAtual;
    }

    valores.push(id);

    try {
      const { rows } = await db.query(
        `
          UPDATE usuarios
          SET ${campos.join(", ")}
          WHERE id = $${i}
          RETURNING id, nome, email, cargo, created_at
          `,
        valores,
      );

      return rows[0];
    } catch (err) {
      if (err.code === "23505") {
        throw ConflictError("Email já cadastrado", "EMAIL_ALREADY_EXISTS");
      }
      throw err;
    }
  }

  async function removerUsuario(id) {
    const { rowCount } = await db.query(
      `SELECT 1 FROM usuarios WHERE id = $1`,
      [id],
    );

    if (rowCount === 0) {
      throw NotFoundError("Usuário não encontrado", "USER_NOT_FOUND");
    }

    const { rowCount: emprestimosAtivos } = await db.query(
      `
      SELECT 1
      FROM emprestimos
      WHERE usuario_id = $1
        AND status = 'ativo'
      `,
      [id],
    );

    if (emprestimosAtivos > 0) {
      throw ConflictError(
        "Usuário possui empréstimos ativos",
        "USER_HAS_ACTIVE_LOANS",
      );
    }

    const { rows } = await db.query(
      `
      DELETE FROM usuarios
      WHERE id = $1
      RETURNING id, nome, email, cargo, created_at
      `,
      [id],
    );

    return rows[0];
  }

  return {
    buscarUsuarios,
    buscarUsuarioPorId,
    criarUsuario,
    modificarUsuario,
    removerUsuario,
  };
}
