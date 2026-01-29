CREATE TABLE usuarios (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  cargo VARCHAR(50) NOT NULL CHECK (cargo IN ('bibliotecario', 'membro')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE livros (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  autor VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  publicado_em DATE,
  copias_disponiveis INT NOT NULL,
  criado_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE emprestimos (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INT NOT NULL,
  livro_id INT NOT NULL,
  data_emprestimo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_prevista_devolucao TIMESTAMP NOT NULL,
  data_devolucao TIMESTAMP,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ativo', 'atrasado', 'devolvido')),

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (livro_id) REFERENCES livros(id)
);

CREATE TABLE reservas (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INT NOT NULL,
  livro_id INT NOT NULL,
  data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ativa', 'cancelada', 'expirada')),

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (livro_id) REFERENCES livros(id)
);

CREATE TABLE multas (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emprestimos_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  pago BOOLEAN DEFAULT FALSE CHECK (
    (pago = false AND data_pagamento IS NULL)
    OR 
    (pago = true AND data_pagamento IS NOT NULL)), 
  data_pagamento TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (emprestimos_id) REFERENCES emprestimos(id)
);

