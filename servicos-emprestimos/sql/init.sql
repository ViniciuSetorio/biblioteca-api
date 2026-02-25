CREATE TABLE IF NOT EXISTS emprestimos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  data_emprestimo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_prevista_devolucao TIMESTAMP NOT NULL,
  data_devolucao TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'devolvido', 'atrasado'))
);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'expirada'))
);