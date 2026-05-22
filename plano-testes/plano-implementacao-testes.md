# 📋 Plano de Implementação de Testes - Biblioteca API

## 1. Visão Geral

Este documento descreve o plano completo de implementação dos **20 casos de teste** para o sistema Biblioteca API, utilizando **Vitest** e **Supertest** para testes de integração/funcionais.

### Arquitetura de Testes Proposta

```
biblioteca-api/
├── plano-testes/
│   ├── plano-implementacao-testes.md    # Este documento
│   └── guia-execucao.md                 # Guia para executar os testes
├── tests/                                # Diretório raiz de testes
│   ├── setup/                            # Configuração e utilitários
│   │   ├── test-environment.js           # Setup do ambiente de testes
│   │   ├── mock-server.js                # Servidor mock para dependências
│   │   └── fixtures.js                   # Dados de teste (fixtures)
│   ├── integration/                      # Testes de integração
│   │   ├── usuarios.test.js              # CT01-CT05
│   │   ├── livros.test.js                # CT06-CT07
│   │   ├── emprestimos.test.js           # CT08-CT12
│   │   ├── reservas.test.js              # CT13-CT14
│   │   ├── multas.test.js                # CT15-CT16
│   │   ├── notificacoes.test.js          # CT17-CT18
│   │   └── gateway.test.js               # CT19-CT20
│   └── unit/                             # Testes unitários (futuro)
│       └── ...
├── vitest.config.js                      # Configuração do Vitest
└── package.json                          (atualizado)
```

---

## 2. Configuração do Ambiente de Testes

### 2.1 Dependências Necessárias

```json
{
  "devDependencies": {
    "@biomejs/biome": "2.3.11",
    "supertest": "^7.2.2",
    "vitest": "^4.0.18",
    "@vitest/coverage-v8": "^4.0.18",
    "testcontainers": "^10.7.1"
  }
}
```

### 2.2 Configuração do Vitest (`vitest.config.js`)

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup/'],
    },
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup/test-environment.js'],
  },
});
```

### 2.3 Scripts de Teste (package.json)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "test:cov": "vitest run --coverage",
    "test:integration": "vitest run tests/integration/",
    "test:unit": "vitest run tests/unit/",
    "test:verbose": "vitest run --reporter=verbose"
  }
}
```

---

## 3. Estratégia de Testes

### 3.1 Abordagem: Testes de Integração com Serviços Reais

Cada microsserviço será testado de forma **isolada**, utilizando:
- **Banco de dados dedicado** para testes (via Docker/Testcontainers ou banco separado)
- **Mocks HTTP** para simular serviços dependentes (ex: serviço de empréstimos mockado ao testar usuários)
- **Supertest** para realizar requisições HTTP contra o servidor Express

### 3.2 Padrão de Organização dos Testes

Cada arquivo de teste segue o padrão **AAA (Arrange-Act-Assert)**:

```javascript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../servico-usuarios/src/app';
import { setupTestDb, teardownTestDb, clearTables } from '../setup/test-environment';

describe('CT01-CT05: Serviço de Usuários', () => {
  let app;
  let db;

  beforeAll(async () => {
    db = await setupTestDb('usuarios');
    app = createApp(db);
  });

  beforeEach(async () => {
    await clearTables(db, ['usuarios']);
  });

  afterAll(async () => {
    await teardownTestDb(db);
  });

  describe('CT01: Criar Usuário - Dados Válidos', () => {
    it('deve criar um usuário com sucesso quando dados são válidos', async () => {
      // Arrange
      const usuarioValido = {
        nome: 'João Silva',
        email: 'joao@email.com',
        cargo: 'membro',
      };

      // Act
      const response = await request(app)
        .post('/usuarios')
        .send(usuarioValido)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        nome: 'João Silva',
        email: 'joao@email.com',
        cargo: 'membro',
      });
      expect(response.body.created_at).toBeDefined();
    });
  });
});
```

---

## 4. Plano de Implementação por Caso de Teste

### 4.1 Módulo: Serviço de Usuários (CT01-CT05)

**Arquivo:** `tests/integration/usuarios.test.js`

| CT | Cenário | Endpoint | Status Esperado | Dependências |
|----|---------|----------|-----------------|--------------|
| CT01 | Criar usuário válido | POST /usuarios | 201 Created | Nenhuma |
| CT02 | Criar usuário com email duplicado | POST /usuarios | 409 Conflict | CT01 (usuário existente) |
| CT03 | Criar usuário com cargo inválido | POST /usuarios | 400 Bad Request | Nenhuma |
| CT04 | Buscar usuário por ID válido | GET /usuarios/:id | 200 OK | CT01 (usuário existente) |
| CT05 | Buscar usuário por ID inexistente | GET /usuarios/:id | 404 Not Found | Nenhuma |

**Fixtures:**
```javascript
const fixtures = {
  usuarioValido: {
    nome: 'Maria Santos',
    email: 'maria@email.com',
    cargo: 'bibliotecario',
  },
  usuarioMembro: {
    nome: 'João Silva',
    email: 'joao@email.com',
    cargo: 'membro',
  },
  cargoInvalido: {
    nome: 'Teste',
    email: 'teste@email.com',
    cargo: 'admin', // Inválido: deve ser 'bibliotecario' ou 'membro'
  },
};
```

---

### 4.2 Módulo: Serviço de Livros (CT06-CT07)

**Arquivo:** `tests/integration/livros.test.js`

| CT | Cenário | Endpoint | Status Esperado | Dependências |
|----|---------|----------|-----------------|--------------|
| CT06 | Criar livro com ISBN único | POST /livros | 201 Created | Mock serviço usuários |
| CT07 | Criar livro com ISBN duplicado | POST /livros | 409 Conflict | CT06 (livro existente) |

**Fixtures:**
```javascript
const fixtures = {
  livroValido: {
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    isbn: '978-0132350884',
    publicado_em: '2008-08-01',
    copias_disponiveis: 3,
  },
  livroDuplicado: {
    titulo: 'Clean Code 2nd Edition',
    autor: 'Robert C. Martin',
    isbn: '978-0132350884', // Mesmo ISBN
    copias_disponiveis: 1,
  },
};
```

**Mock Necessário:**
- Serviço de Usuários: Simular resposta de bibliotecário válido para `criado_por`

---

### 4.3 Módulo: Serviço de Empréstimos (CT08-CT12)

**Arquivo:** `tests/integration/emprestimos.test.js`

| CT | Cenário | Endpoint | Status Esperado | Dependências |
|----|---------|----------|-----------------|--------------|
| CT08 | Criar empréstimo com dados válidos | POST /emprestimos | 201 Created | Mock usuários + livros |
| CT09 | Criar empréstimo sem cópias disponíveis | POST /emprestimos | 400/409 Conflict | Mock livros (0 cópias) |
| CT10 | Criar empréstimo com usuário inexistente | POST /emprestimos | 404 Not Found | Mock usuários (404) |
| CT11 | Devolver empréstimo ativo | PUT /emprestimos/:id/devolver | 200 OK | CT08 (empréstimo ativo) |
| CT12 | Devolver empréstimo já devolvido | PUT /emprestimos/:id/devolver | 400/409 Conflict | CT11 (já devolvido) |

**Fixtures:**
```javascript
const fixtures = {
  emprestimoValido: {
    usuarioId: 1,
    livroId: 1,
  },
  livroSemCopias: {
    id: 2,
    titulo: 'Livro Esgotado',
    copias_disponiveis: 0,
  },
};
```

**Mocks Necessários:**
- Serviço de Usuários: `GET /usuarios/:id` → retorna usuário válido
- Serviço de Livros: `GET /livros/:id` → retorna livro com cópias disponíveis
- Serviço de Livros: `PUT /livros/:id` → atualiza cópias (simular sucesso)

---

### 4.4 Módulo: Serviço de Reservas (CT13-CT14)

**Arquivo:** `tests/integration/reservas.test.js`

| CT | Cenário | Endpoint | Status Esperado | Dependências |
|----|---------|----------|-----------------|--------------|
| CT13 | Criar reserva para livro indisponível | POST /reservas | 201 Created | Mock usuários + livros |
| CT14 | Criar reserva para livro disponível | POST /reservas | 400/409 Conflict | Mock livros (disponível) |

**Fixtures:**
```javascript
const fixtures = {
  reservaValida: {
    usuarioId: 1,
    livroId: 1, // Livro sem cópias disponíveis
  },
};
```

---

### 4.5 Módulo: Serviço de Multas (CT15-CT16)

**Arquivo:** `tests/integration/multas.test.js`

| CT | Cenário | Endpoint | Status Esperado | Dependências |
|----|---------|----------|-----------------|--------------|
| CT15 | Calcular multa para empréstimo atrasado | POST /multas | 201 Created (valor > 0) | Mock empréstimos |
| CT16 | Verificar multa para empréstimo no prazo | POST /multas | 200 OK (valor = 0) | Mock empréstimos |

**Fixtures:**
```javascript
const fixtures = {
  multaAtrasada: {
    emprestimoId: 1,
    valor: 10.00, // 5 dias * R$2/dia
  },
  multaNoPrazo: {
    emprestimoId: 2,
    valor: 0,
  },
};
```

---

### 4.6 Módulo: Serviço de Notificações (CT17-CT18)

**Arquivo:** `tests/integration/notificacoes.test.js`

| CT | Cenário | Endpoint | Status Esperado | Dependências |
|----|---------|----------|-----------------|--------------|
| CT17 | Enviar notificação com dados válidos | POST /notificacoes | 202 Accepted | Mock usuários |
| CT18 | Enviar notificação com tipo inválido | POST /notificacoes | 400 Bad Request | Nenhuma |

**Fixtures:**
```javascript
const fixtures = {
  notificacaoValida: {
    tipo: 'emprestimo',
    usuarioId: 1,
    emprestimoId: 1,
  },
  notificacaoInvalida: {
    tipo: 'tipo_inexistente', // Inválido
    usuarioId: 1,
  },
};
```

---

### 4.7 Módulo: API Gateway (CT19-CT20)

**Arquivo:** `tests/integration/gateway.test.js`

| CT | Cenário | Endpoint | Status Esperado | Dependências |
|----|---------|----------|-----------------|--------------|
| CT19 | Health check do gateway | GET /health | 200 OK | Todos os serviços |
| CT20 | Gateway com serviço indisponível | GET /usuarios | 504 após retry | Mock serviço down |

---

## 5. Implementação dos Utilitários de Teste

### 5.1 Ambiente de Teste (`tests/setup/test-environment.js`)

```javascript
import { Pool } from 'pg';
import { GenericContainer } from 'testcontainers';

let container;
let pool;

export async function setupTestDb(serviceName) {
  // Iniciar container PostgreSQL para testes
  container = await new GenericContainer('postgres:15-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: `${serviceName}_test`,
    })
    .withExposedPorts(5432)
    .start();

  const port = container.getMappedPort(5432);
  const host = container.getHost();

  pool = new Pool({
    user: 'test',
    host,
    database: `${serviceName}_test`,
    password: 'test',
    port,
  });

  // Executar migrations/init.sql
  const initSql = readFileSync(
    `../../servico-${serviceName}/sql/init.sql`,
    'utf-8'
  );
  await pool.query(initSql);

  return pool;
}

export async function clearTables(db, tables) {
  for (const table of tables) {
    await db.query(`TRUNCATE TABLE ${table} CASCADE`);
  }
}

export async function teardownTestDb() {
  await pool?.end();
  await container?.stop();
}
```

### 5.2 Servidor Mock (`tests/setup/mock-server.js`)

```javascript
import express from 'express';

export function createMockServer(port, routes) {
  const app = express();
  app.use(express.json());

  routes.forEach(({ method, path, handler }) => {
    app[method](path, handler);
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve({
        server,
        url: `http://localhost:${port}`,
        close: () => server.close(),
      });
    });
  });
}

// Exemplo: Mock do Serviço de Usuários
export async function createMockUsuariosService() {
  const usuarios = new Map();
  let nextId = 1;

  return createMockServer(3099, [
    {
      method: 'get',
      path: '/usuarios/:id',
      handler: (req, res) => {
        const usuario = usuarios.get(Number(req.params.id));
        if (!usuario) return res.status(404).json({ message: 'Não encontrado' });
        res.json(usuario);
      },
    },
    {
      method: 'post',
      path: '/usuarios',
      handler: (req, res) => {
        const usuario = { id: nextId++, ...req.body };
        usuarios.set(usuario.id, usuario);
        res.status(201).json(usuario);
      },
    },
  ]);
}
```

### 5.3 Fixtures (`tests/setup/fixtures.js`)

```javascript
export const fixtures = {
  usuarios: {
    bibliotecario: {
      nome: 'Admin Biblioteca',
      email: 'admin@biblioteca.com',
      cargo: 'bibliotecario',
    },
    membro: {
      nome: 'João Leitor',
      email: 'joao@email.com',
      cargo: 'membro',
    },
    invalido: {
      nome: 'Teste',
      email: 'teste@test.com',
      cargo: 'cargo_invalido',
    },
  },
  livros: {
    disponivel: {
      titulo: 'O Senhor dos Anéis',
      autor: 'J.R.R. Tolkien',
      isbn: '978-0544003415',
      copias_disponiveis: 5,
    },
    indisponivel: {
      titulo: 'Livro Raro',
      autor: 'Autor Desconhecido',
      isbn: '978-0000000001',
      copias_disponiveis: 0,
    },
    isbnDuplicado: {
      titulo: 'Outro Livro',
      autor: 'Outro Autor',
      isbn: '978-0544003415', // Mesmo ISBN
      copias_disponiveis: 1,
    },
  },
  emprestimos: {
    valido: {
      usuarioId: 1,
      livroId: 1,
    },
  },
  reservas: {
    valida: {
      usuarioId: 1,
      livroId: 2, // Livro indisponível
    },
  },
  multas: {
    atrasada: {
      emprestimoId: 1,
      valor: 10.00,
    },
    noPrazo: {
      emprestimoId: 2,
      valor: 0,
    },
  },
  notificacoes: {
    valida: {
      tipo: 'emprestimo',
      usuarioId: 1,
      emprestimoId: 1,
    },
    invalida: {
      tipo: 'tipo_inexistente',
      usuarioId: 1,
    },
  },
};
```

---

## 6. Ordem de Implementação

### Fase 1: Infraestrutura (Prioridade Alta)
1. Instalar dependências (`@vitest/coverage-v8`, `testcontainers`)
2. Criar `vitest.config.js`
3. Criar `tests/setup/test-environment.js`
4. Criar `tests/setup/mock-server.js`
5. Criar `tests/setup/fixtures.js`
6. Atualizar `package.json` com scripts de teste

### Fase 2: Testes de Usuários e Livros (Prioridade Alta)
7. Implementar `tests/integration/usuarios.test.js` (CT01-CT05)
8. Implementar `tests/integration/livros.test.js` (CT06-CT07)

### Fase 3: Testes de Empréstimos e Reservas (Prioridade Alta)
9. Implementar `tests/integration/emprestimos.test.js` (CT08-CT12)
10. Implementar `tests/integration/reservas.test.js` (CT13-CT14)

### Fase 4: Testes de Multas e Notificações (Prioridade Média)
11. Implementar `tests/integration/multas.test.js` (CT15-CT16)
12. Implementar `tests/integration/notificacoes.test.js` (CT17-CT18)

### Fase 5: Testes de Gateway (Prioridade Média)
13. Implementar `tests/integration/gateway.test.js` (CT19-CT20)

### Fase 6: Documentação e Cobertura
14. Gerar relatório de cobertura
15. Criar `plano-testes/guia-execucao.md`

---

## 7. Comandos de Execução

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar com cobertura de código
npm run test:cov

# Executar testes de um módulo específico
npx vitest run tests/integration/usuarios.test.js

# Executar com output detalhado
npm run test:verbose
```

---

## 8. Critérios de Aceitação

- [ ] Todos os 20 casos de teste implementados e passando
- [ ] Cobertura de código mínima de 80% nos serviços testados
- [ ] Testes executam em menos de 60 segundos
- [ ] Nenhum teste depende de serviços externos reais
- [ ] Documentação de execução clara e completa

---

## 9. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Testcontainers não disponível no ambiente | Alto | Usar banco SQLite em memória como fallback |
| Timeout em testes de integração | Médio | Aumentar `testTimeout` para 60s |
| Conflito de portas entre serviços mock | Médio | Usar portas dinâmicas |
| Dependência circular entre serviços | Alto | Mocks HTTP para isolar serviços |

---

## 10. Referências

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Testcontainers Node.js](https://node.testcontainers.org/)
- [descricao-aplicacao.md](../descricao-aplicacao.md)
