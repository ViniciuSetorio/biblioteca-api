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

INSERT INTO usuarios (nome, email, cargo)
VALUES ('Ana Bibliotecária', 'ana@biblioteca.com', 'bibliotecario'),
       ('Carlos Bibliotecário', 'carlos@biblioteca.com', 'bibliotecario'),
       ('João Silva', 'joao.silva@email.com', 'membro'),
       ('Maria Oliveira', 'maria.oliveira@email.com', 'membro'),
       ('Pedro Santos', 'pedro.santos@email.com', 'membro');

INSERT INTO livros (titulo, autor, isbn, publicado_em, copias_disponiveis, criado_por)
VALUES ('Clean Code', 'Robert C. Martin', '9780132350884', '2008-08-01', 3, 1),
       ('Domain-Driven Design', 'Eric Evans', '9780321125217', '2003-08-30', 2, 1),
       ('Refactoring', 'Martin Fowler', '9780201485677', '1999-07-08', 1, 2),
       ('Design Patterns', 'Erich Gamma', '9780201633610', '1994-10-31', 0, 2);

INSERT INTO emprestimos (
  usuario_id,
  livro_id,
  data_emprestimo,
  data_prevista_devolucao,
  data_devolucao,
  status
) VALUES
-- Empréstimo ativo
(3, 1, CURRENT_TIMESTAMP - INTERVAL '5 days',
 CURRENT_TIMESTAMP + INTERVAL '10 days',
 NULL,
 'ativo'),

-- Empréstimo devolvido
(4, 2, CURRENT_TIMESTAMP - INTERVAL '20 days',
 CURRENT_TIMESTAMP - INTERVAL '10 days',
 CURRENT_TIMESTAMP - INTERVAL '9 days',
 'devolvido'),

-- Empréstimo atrasado
(5, 4, CURRENT_TIMESTAMP - INTERVAL '30 days',
 CURRENT_TIMESTAMP - INTERVAL '15 days',
 NULL,
 'atrasado');

INSERT INTO reservas (
  usuario_id,
  livro_id,
  data_reserva,
  data_expiracao,
  status
) VALUES
-- Reserva ativa
(3, 4, CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '3 days',
 'ativa'),

-- Reserva cancelada
(4, 3, CURRENT_TIMESTAMP - INTERVAL '7 days',
 CURRENT_TIMESTAMP - INTERVAL '2 days',
 'cancelada'),

-- Reserva expirada
(5, 1, CURRENT_TIMESTAMP - INTERVAL '10 days',
 CURRENT_TIMESTAMP - INTERVAL '5 days',
 'expirada');

-- Multa em aberto (empréstimo atrasado)
INSERT INTO multas (emprestimos_id, valor, pago, data_pagamento)
VALUES (3, 15.50, false, NULL);

-- Multa paga (exemplo adicional)
INSERT INTO multas (emprestimos_id, valor, pago, data_pagamento)
VALUES (2, 5.00, true, CURRENT_TIMESTAMP - INTERVAL '8 days');