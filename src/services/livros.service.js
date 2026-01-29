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
