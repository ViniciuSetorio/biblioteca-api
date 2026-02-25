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
      `SELECT id, titulo, autor, isbn, publicado_em, copias_disponiveis, criado_por, created_at
       FROM livros
       WHERE id = $1`,
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

    // Verificar se usuário existe e é bibliotecário
    if (criado_por) {
      try {
        const usuariosServiceUrl = process.env.USUARIOS_SERVICE_URL || 'http://servico-usuarios:3001';
        const response = await fetch(`${usuariosServiceUrl}/usuarios/${criado_por}`);
        
        if (!response.ok) {
          const error = new Error("Usuário criador não encontrado");
          error.code = "CREATOR_NOT_FOUND";
          error.statusCode = 422;
          throw error;
        }

        const usuario = await response.json();
        
        if (usuario.cargo !== "bibliotecario") {
          const error = new Error("Apenas bibliotecários podem cadastrar livros");
          error.code = "INSUFFICIENT_ROLE";
          error.statusCode = 422;
          throw error;
        }
      } catch (error) {
        if (error.statusCode) throw error;
        console.error("Erro ao verificar usuário:", error.message);
        // Se não conseguir verificar, permite criar mesmo assim?
        // Por segurança, vamos bloquear
        const err = new Error("Não foi possível verificar o usuário criador");
        err.code = "USER_SERVICE_UNAVAILABLE";
        err.statusCode = 503;
        throw err;
      }
    }

    const result = await db.query(
      `INSERT INTO livros (titulo, autor, isbn, publicado_em, criado_por, copias_disponiveis)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [titulo, autor, isbn, publicado_em, criado_por, copias_disponiveis],
    );

    return result.rows[0];
  }

  async function modificarLivro(id, data) {
    const { titulo, autor, isbn, publicado_em, criado_por, copias_disponiveis } = data;

    if (criado_por !== undefined) {
      try {
        const usuariosServiceUrl = process.env.USUARIOS_SERVICE_URL || 'http://servico-usuarios:3001';
        const response = await fetch(`${usuariosServiceUrl}/usuarios/${criado_por}`);
        
        if (!response.ok) {
          const error = new Error("Usuário criador não encontrado");
          error.code = "CREATOR_NOT_FOUND";
          error.statusCode = 422;
          throw error;
        }

        const usuario = await response.json();
        
        if (usuario.cargo !== "bibliotecario") {
          const error = new Error("Apenas bibliotecários podem ser definidos como criador do livro");
          error.code = "INSUFFICIENT_ROLE";
          error.statusCode = 422;
          throw error;
        }
      } catch (error) {
        if (error.statusCode) throw error;
        console.error("Erro ao verificar usuário:", error.message);
        const err = new Error("Não foi possível verificar o usuário criador");
        err.code = "USER_SERVICE_UNAVAILABLE";
        err.statusCode = 503;
        throw err;
      }
    }

    const query = `
      UPDATE livros
      SET titulo = COALESCE($1, titulo), 
          autor = COALESCE($2, autor), 
          isbn = COALESCE($3, isbn),
          publicado_em = COALESCE($4, publicado_em), 
          criado_por = COALESCE($5, criado_por),
          copias_disponiveis = COALESCE($6, copias_disponiveis)
      WHERE id = $7
      RETURNING *;
    `;

    const valores = [titulo, autor, isbn, publicado_em, criado_por, copias_disponiveis, id];
    const { rows } = await db.query(query, valores);
    return rows[0];
  }

  async function removerLivro(id) {
    // Verificar se livro tem empréstimos ativos
    try {
      const emprestimosServiceUrl = process.env.EMPRESTIMOS_SERVICE_URL || 'http://servico-emprestimos:3003';
      const response = await fetch(`${emprestimosServiceUrl}/emprestimos?livroId=${id}&status=ativo`);
      
      if (response.ok) {
        const emprestimos = await response.json();
        if (emprestimos.length > 0) {
          const error = new Error("Livro possui empréstimos ativos");
          error.code = "BOOK_HAS_ACTIVE_LOANS";
          error.statusCode = 409;
          throw error;
        }
      }
    } catch (error) {
      if (error.statusCode) throw error;
      console.error("Erro ao verificar empréstimos:", error.message);
    }

    const query = `DELETE FROM livros WHERE id = $1 RETURNING *`;
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