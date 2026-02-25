CREATE TABLE IF NOT EXISTS emprestimos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  data_emprestimo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_prevista_devolucao TIMESTAMP NOT NULL,
  data_devolucao TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'devolvido'))
);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'expirada'))
);

CREATE INDEX IF NOT EXISTS idx_emprestimos_usuario ON emprestimos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_emprestimos_livro ON emprestimos(livro_id);
CREATE INDEX IF NOT EXISTS idx_emprestimos_status ON emprestimos(status);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservas_livro ON reservas(livro_id);
CREATE INDEX IF NOT EXISTS idx_reservas_status ON reservas(status);