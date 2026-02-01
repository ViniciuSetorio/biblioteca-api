export default function createLivrosService(db) {
  async function buscarLivros() {
    const resultado = await db.query(`
      SELECT id, titulo, autor, isbn, publicado_em, copias_disponiveis, criado_por, created_at
      FROM livros
      ORDER BY titulo
    `);

    return resultado.rows;
  }

  async function buscarLivroPorId(id) {
    const result = await db.query(
      `
      SELECT id, titulo, autor, isbn, publicado_em, copias_disponiveis, criado_por, created_at
      FROM livros
      WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] || null;
  }

  async function criarLivro(data) {
    const {
      titulo,
      autor,
      isbn = null,
      publicado_em = null,
      criado_por = null,
      copias_disponiveis = 0,
    } = data;

    if (criado_por) {
      const usuarioExiste = await db.query(
        "SELECT id, cargo FROM usuarios WHERE id = $1",
        [criado_por],
      );

      if (usuarioExiste.rowCount === 0) {
        const error = new Error("Usuário criador não encontrado");
        error.code = "CREATOR_NOT_FOUND";
        error.httpStatus = 422;
        throw error;
      }

      if (usuarioExiste.rows[0].cargo !== "bibliotecario") {
        const error = new Error("Apenas bibliotecários podem cadastrar livros");
        error.code = "INSUFFICIENT_ROLE";
        error.httpStatus = 422;
        throw error;
      }
    }

    const result = await db.query(
      `
      INSERT INTO livros (titulo, autor, isbn, publicado_em, criado_por, copias_disponiveis)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [titulo, autor, isbn, publicado_em, criado_por, copias_disponiveis],
    );

    return result.rows[0];
  }

  async function modificarLivro(id, data) {
    const {
      titulo,
      autor,
      isbn,
      publicado_em,
      criado_por,
      copias_disponiveis,
    } = data;

    if (criado_por !== undefined) {
      const { rows, rowCount } = await db.query(
        `SELECT id, cargo FROM usuarios WHERE id = $1`,
        [criado_por],
      );

      if (rowCount === 0) {
        const error = new Error("Usuário criador não encontrado");
        error.code = "CREATOR_NOT_FOUND";
        error.httpStatus = 422;
        throw error;
      }

      if (rows[0].cargo !== "bibliotecario") {
        const error = new Error(
          "Apenas bibliotecários podem ser definidos como criador do livro",
        );
        error.code = "INSUFFICIENT_ROLE";
        error.httpStatus = 422;
        throw error;
      }
    }
    const query = `
      UPDATE livros
      SET titulo = COALESCE($1, titulo), autor = COALESCE($2, autor), isbn = COALESCE($3, isbn),
        publicado_em = COALESCE($4, publicado_em), criado_por = COALESCE($5, criado_por),
        copias_disponiveis = COALESCE($6, copias_disponiveis)
      WHERE id = $7
      RETURNING *;
    `;

    const valores = [
      titulo,
      autor,
      isbn,
      publicado_em,
      criado_por,
      copias_disponiveis,
      id,
    ];

    const { rows } = await db.query(query, valores);

    return rows[0];
  }

  async function removerLivro(id) {
    const query = `
      DELETE FROM livros
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  return {
    buscarLivros,
    buscarLivroPorId,
    criarLivro,
    modificarLivro,
    removerLivro,
  };
}
