CREATE TABLE IF NOT EXISTS livros (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  publicado_em DATE,
  criado_por INTEGER,
  copias_disponiveis INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO livros (titulo, autor, isbn, publicado_em, copias_disponiveis) 
VALUES 
  ('Clean Code', 'Robert C. Martin', '9780132350884', '2008-08-01', 3),
  ('Domain-Driven Design', 'Eric Evans', '9780321125217', '2003-08-30', 2),
  ('The Pragmatic Programmer', 'David Thomas', '9780201616224', '1999-10-30', 1)
ON CONFLICT (isbn) DO NOTHING;