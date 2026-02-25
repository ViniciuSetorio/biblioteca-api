CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cargo VARCHAR(50) CHECK (cargo IN ('bibliotecario', 'membro')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, cargo) 
VALUES ('Admin Biblioteca', 'admin@biblioteca.com', 'bibliotecario')
ON CONFLICT (email) DO NOTHING;