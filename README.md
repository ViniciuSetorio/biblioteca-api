# 📚 Biblioteca API - Sistema de Gerenciamento de Biblioteca

Uma aplicação robusta e escalável para gerenciamento de biblioteca desenvolvida com **arquitetura de microsserviços** em Node.js + Express, utilizando PostgreSQL e Docker.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Serviços Disponíveis](#serviços-disponíveis)
4. [Tecnologias](#tecnologias)
5. [Instalação](#instalação)
6. [Execução](#execução)
7. [Estrutura do Projeto](#estrutura-do-projeto)
8. [Endpoints da API](#endpoints-da-api)
9. [Banco de Dados](#banco-de-dados)
10. [Deployment](#deployment)

---

## 🎯 Visão Geral

Este projeto é um **sistema de gerenciamento de biblioteca** que permite:

- ✅ Gerenciar usuários (cadastro, autenticação, perfil)
- ✅ Catalogar e gerenciar livros
- ✅ Registrar empréstimos de livros
- ✅ Gerenciar reservas de livros
- ✅ Calcular e controlar multas por atraso
- ✅ Enviar notificações por email e SMS

A aplicação foi desenvolvida como **trabalho de Engenharia de Software II** utilizando conceitos de **Design Patterns** (Singleton), **Microsserviços** e **Clean Architecture**.

---

## 🏗️ Arquitetura

### Padrão Arquitetural: **Microsserviços**

A aplicação segue o padrão de arquitetura de **microsserviços**, onde cada funcionalidade é isolada em um serviço independente que se comunica com outros através de requisições HTTP.

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vercel)                       │
│                  (https://bibton.vercel.app)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 3000)                          │
│          Proxy reverso para todos os serviços                │
└──────┬──────┬──────┬──────┬──────────────────────────────────┘
       │      │      │      │
   ┌───▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐    ┌──────────────────┐
   │ Usuá │ │Liv │ │Empr│ │Mult│    │  Notificações    │
   │ rios │ │ ros│ │ ós │ │ as │    │  (Serviço Async) │
   └───┬──┘ └─┬──┘ └─┬──┘ └─┬──┘    └────────┬─────────┘
   ┌───▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐             │
   │ 3001 │ │3002│ │3003│ │3004│             │ 3005
   └───┬──┘ └─┬──┘ └─┬──┘ └─┬──┘             │
       │      │      │      │                │
   ┌───▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐         ┌──▼──┐
   │PG1   │ │PG2 │ │PG3 │ │PG4 │         │Email│
   │(U)   │ │(L) │ │(E) │ │(M) │         │ SMS │
   └──────┘ └────┘ └────┘ └────┘         └─────┘
```

### Características da Arquitetura:

- **Isolamento**: Cada serviço tem seu próprio banco de dados e responsabilidades
- **Escalabilidade**: Serviços podem ser escalados independentemente
- **Resiliência**: Falha em um serviço não derruba toda a aplicação
- **Separação de Responsabilidades**: Cada microsserviço tem um propósito específico
- **Comunicação via HTTP/REST**: Serviços se comunicam através de chamadas HTTP

---

## 🔧 Serviços Disponíveis

### 1. **API Gateway** (Port 3000)

O ponto de entrada único da aplicação. Funciona como um proxy reverso inteligente com **retry automático** que roteia requisições para os serviços apropriados e aguarda serviços em hibernação acordarem.

**Função Principal:**
- Rotear requisições para os microsserviços corretos
- **Retry automático** com `axios-retry` em caso de erros 502/503/504 ou falhas de rede
- Aplicar políticas de CORS
- Fornecer health check centralizado

**Rotas Proxy:**
- `/usuarios` → Serviço de Usuários (3001)
- `/livros` → Serviço de Livros (3002)
- `/emprestimos` → Serviço de Empréstimos (3003)
- `/reservas` → Serviço de Empréstimos/Reservas (3003)
- `/multas` → Serviço de Multas (3004)
- `/health` → Status de todos os serviços

**Configuração de Retry:**
```javascript
// Tentativas: 5
// Delay: Exponencial (aumenta progressivamente a cada tentativa)
// Condição: Apenas erros de rede ou HTTP 502, 503, 504
// Não faz retry em erros 4xx (ex: 404, 401)
```

---

### 2. **Serviço de Usuários** (Port 3001)

Responsável por gerenciar usuários da biblioteca.

**Funcionalidades:**
- 👤 Criar novo usuário
- 📋 Listar todos os usuários
- 🔍 Buscar usuário por ID
- ✏️ Atualizar dados do usuário
- 🗑️ Deletar usuário

**Endpoints:**
```
GET    /usuarios          - Listar todos os usuários
POST   /usuarios          - Criar novo usuário
GET    /usuarios/:id      - Obter usuário por ID
PUT    /usuarios/:id      - Atualizar usuário
DELETE /usuarios/:id      - Deletar usuário
GET    /health            - Verificar saúde do serviço
```

**Banco de Dados:** `usuarios_db` (PostgreSQL)

---

### 3. **Serviço de Livros** (Port 3002)

Responsável pelo catálogo e gerenciamento de livros.

**Funcionalidades:**
- 📖 Adicionar novo livro ao acervo
- 📚 Listar todos os livros disponíveis
- 🔎 Buscar livro por ID ou título
- ✏️ Atualizar informações do livro
- 🗑️ Remover livro do acervo

**Endpoints:**
```
GET    /livros           - Listar todos os livros
POST   /livros           - Adicionar novo livro
GET    /livros/:id       - Obter livro por ID
PUT    /livros/:id       - Atualizar livro
DELETE /livros/:id       - Deletar livro
GET    /health           - Verificar saúde do serviço
```

**Banco de Dados:** `livros_db` (PostgreSQL)

**Integração:** Comunica-se com o Serviço de Usuários e Empréstimos para validações de dados.

---

### 4. **Serviço de Empréstimos** (Port 3003)

Gerencia empréstimos e reservas de livros.

**Funcionalidades:**
- 📅 Registrar novo empréstimo
- 📋 Listar empréstimos ativos
- 🔄 Renovar empréstimo
- ✔️ Devolver livro
- 📌 Criar reserva de livro
- 📂 Gerenciar fila de reservas

**Endpoints:**
```
GET    /emprestimos              - Listar empréstimos
POST   /emprestimos              - Criar novo empréstimo
GET    /emprestimos/:id          - Obter empréstimo por ID
PUT    /emprestimos/:id          - Atualizar empréstimo
DELETE /emprestimos/:id          - Deletar empréstimo

GET    /reservas                 - Listar reservas
POST   /reservas                 - Criar nova reserva
GET    /reservas/:id             - Obter reserva por ID
DELETE /reservas/:id             - Cancelar reserva
GET    /health                   - Verificar saúde do serviço
```

**Banco de Dados:** `emprestimos_db` (PostgreSQL)

**Integração:** 
- Comunica com Serviço de Usuários para validar dados
- Comunica com Serviço de Livros para verificar disponibilidade
- Interage com Serviço de Notificações para alertas

---

### 5. **Serviço de Multas** (Port 3004)

Responsável pelo cálculo e gerenciamento de multas por atraso.

**Funcionalidades:**
- 💰 Calcular multa por atraso
- 📊 Listar multas pendentes
- ✔️ Registrar pagamento de multa
- 🔍 Consultar multa por ID do empréstimo
- 📈 Gerar relatórios de multas

**Endpoints:**
```
GET    /multas                  - Listar multas
POST   /multas                  - Criar multa
GET    /multas/:id              - Obter multa por ID
PUT    /multas/:id              - Atualizar multa
DELETE /multas/:id              - Deletar multa
GET    /health                  - Verificar saúde do serviço
```

**Banco de Dados:** `multas_db` (PostgreSQL)

**Integração:** Interage com Serviço de Empréstimos e Notificações.

---

### 6. **Serviço de Notificações** (Port 3005)

Serviço assíncrono responsável por enviar notificações aos usuários.

**Funcionalidades:**
- 📧 Enviar emails de confirmação
- 💬 Enviar SMS de notificação
- ⏰ Alertas de vencimento de empréstimo
- 📬 Notificação de reserva disponível
- 💌 Notificação de multa gerada

**Endpoints:**
```
POST   /notificacoes/email       - Enviar email
POST   /notificacoes/sms         - Enviar SMS
GET    /health                   - Verificar saúde do serviço
```

**Banco de Dados:** Sem banco de dados persistente (Serviço de Integração)

**Provedores:**
- **Email:** Configurável (Gmail, SendGrid, etc.)
- **SMS:** Configurável (Twilio, etc.)

---

## 💻 Tecnologias

### Core
- **Node.js** (v20.6.0+) - Runtime JavaScript
- **Express.js** (v5.2.1) - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Docker & Docker Compose** - Containerização e orquestração

### Utilidades
- **CORS** (v2.8.5) - Controle de requisições cross-origin
- **pg** (v8.17.1) - Driver PostgreSQL
- **Zod** (v4.3.5) - Validação de schemas
- **axios** (v1.6.7) - Cliente HTTP para proxy reverso no API Gateway
- **axios-retry** (v4.0.0) - Retry automático para lidar com serviços em hibernação no Render

### Desenvolvimento
- **Biome** (v2.3.11) - Linting e formatação
- **Vitest** (v4.0.18) - Framework de testes
- **Supertest** (v7.2.2) - Testes de requisições HTTP

### Monitoramento & Documentação
- **Swagger UI Express** - Documentação interativa
- **OpenAPI** - Especificação de API

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** v20.6.0 ou superior
- **Docker** e **Docker Compose**
- **PostgreSQL** (ou usar via Docker)
- **Git**

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/ViniciuSetorio/biblioteca-api.git
cd biblioteca-api
```

### Passo 2: Instalar Dependências

```bash
# Instalar dependências da raiz
npm install

# Instalar dependências de cada serviço
npm --prefix ./api-gateway install
npm --prefix ./servico-usuarios install
npm --prefix ./servico-livros install
npm --prefix ./servico-emprestimos install
npm --prefix ./servico-multas install
npm --prefix ./servico-notificacoes install
```

### Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Frontend
FRONTEND_URL=https://bibton.vercel.app

# URLs dos Serviços (para desenvolvimento local)
USUARIOS_URL=http://servico-usuarios:3001
LIVROS_URL=http://servico-livros:3002
EMPRESTIMOS_URL=http://servico-emprestimos:3003
MULTAS_URL=http://servico-multas:3004

# PostgreSQL
PGUSER=postgres
PGPASSWORD=postgres
PGPORT=5432

# Email/SMS (se usar notificações)
SMTP_HOST=seu-smtp-host
SMTP_USER=seu-usuario-email
SMTP_PASS=sua-senha-email
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
```

---

## 🚀 Execução

### Opção 1: Docker Compose (Recomendado para Produção)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Opção 2: Execução Local (Desenvolvimento)

Cada serviço pode ser executado individualmente:

```bash
# Terminal 1 - API Gateway
npm --prefix ./api-gateway start

# Terminal 2 - Serviço de Usuários
npm --prefix ./servico-usuarios start

# Terminal 3 - Serviço de Livros
npm --prefix ./servico-livros start

# Terminal 4 - Serviço de Empréstimos
npm --prefix ./servico-emprestimos start

# Terminal 5 - Serviço de Multas
npm --prefix ./servico-multas start

# Terminal 6 - Serviço de Notificações
npm --prefix ./servico-notificacoes start
```

### Modo Desenvolvimento com Auto-reload

```bash
npm --prefix ./api-gateway dev
npm --prefix ./servico-usuarios dev
# ... etc
```

---

## 📁 Estrutura do Projeto

```
biblioteca-api/
├── api-gateway/                    # Proxy reverso da API
│   ├── src/
│   │   ├── server.js              # Entry point do gateway (rotas e CORS)
│   │   └── middlewares/
│   │       └── proxy.js           # Middleware de proxy (Axios + Retry)
│   ├── Dockerfile
│   └── package.json
│
├── servico-usuarios/               # Gerenciamento de usuários
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js        # Conexão PostgreSQL
│   │   ├── controllers/
│   │   │   └── usuarios.controller.js
│   │   ├── routes/
│   │   │   └── usuarios.route.js
│   │   ├── services/
│   │   │   └── usuarios.service.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       ├── httpError.js
│   │       └── logger.js
│   ├── sql/
│   │   └── init.sql               # Script de criação do banco
│   ├── Dockerfile
│   └── package.json
│
├── servico-livros/                 # Catálogo de livros
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   │   └── livros.controller.js
│   │   ├── routes/
│   │   │   └── livros.routes.js
│   │   ├── services/
│   │   │   └── livros.service.js
│   │   ├── middleware/
│   │   └── utils/
│   ├── sql/
│   │   └── init.sql
│   ├── Dockerfile
│   └── package.json
│
├── servico-emprestimos/            # Empréstimos e reservas
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── emprestimos.controller.js
│   │   │   └── reservas.controller.js
│   │   ├── core/
│   │   │   └── libraryManager.js  # Design Pattern: Singleton
│   │   ├── routes/
│   │   │   ├── emprestimos.routes.js
│   │   │   └── reservas.routes.js
│   │   ├── services/
│   │   │   └── reservas.service.js
│   │   ├── middleware/
│   │   └── utils/
│   ├── sql/
│   │   └── init.sql
│   ├── Dockerfile
│   └── package.json
│
├── servico-multas/                 # Cálculo de multas
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   │   └── multas.controller.js
│   │   ├── routes/
│   │   │   └── multas.routes.js
│   │   ├── services/
│   │   │   └── multas.service.js
│   │   ├── middleware/
│   │   └── utils/
│   ├── sql/
│   │   └── init.sql
│   ├── Dockerfile
│   └── package.json
│
├── servico-notificacoes/           # Notificações (Email/SMS)
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── email.js
│   │   │   └── logger.js
│   │   ├── controllers/
│   │   │   └── notificacoes.controller.js
│   │   ├── routes/
│   │   │   └── notificacoes.routes.js
│   │   ├── services/
│   │   │   ├── email.service.js
│   │   │   ├── notificacao.service.js
│   │   │   └── sms.service.js
│   │   ├── middleware/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
│
├── Diagramas/                      # Documentação visual
│   └── diagrama-arquitetura.html
│
├── docker-compose.yml              # Orquestração de containers
├── deploy.sh                        # Script de deploy
├── Dockerfile                       # Dockerfile raiz
├── biome.json                       # Configuração de linting
├── railway.json                     # Configuração Railway.app
├── render.yaml                      # Configuração Render.com
├── package.json
└── README.md                        # Este arquivo
```

---

## 🔌 Endpoints da API

### Gateway (3000)

```
GET /health                          - Status geral da aplicação
```

### Usuários (3001)

```
GET    /usuarios                     - Lista todos os usuários
POST   /usuarios                     - Cria novo usuário
GET    /usuarios/:id                 - Obtém usuário por ID
PUT    /usuarios/:id                 - Atualiza usuário
DELETE /usuarios/:id                 - Deleta usuário
GET    /health                       - Health check do serviço
```

**Exemplo de Resposta (GET /usuarios):**
```json
[
  {
    "id": "1",
    "nome": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-10",
    "telefone": "(11) 99999-9999",
    "data_cadastro": "2024-01-15T10:30:00Z"
  }
]
```

### Livros (3002)

```
GET    /livros                       - Lista todos os livros
POST   /livros                       - Adiciona novo livro
GET    /livros/:id                   - Obtém livro por ID
PUT    /livros/:id                   - Atualiza livro
DELETE /livros/:id                   - Remove livro
GET    /health                       - Health check do serviço
```

**Exemplo de Resposta (POST /livros):**
```json
{
  "id": "5",
  "titulo": "Clean Code",
  "autor": "Robert C. Martin",
  "isbn": "0132350882",
  "quantidade": 5,
  "quantidade_disponivel": 5,
  "ano_publicacao": 2008,
  "categoria": "Programação"
}
```

### Empréstimos (3003)

```
GET    /emprestimos                  - Lista empréstimos
POST   /emprestimos                  - Cria novo empréstimo
GET    /emprestimos/:id              - Obtém empréstimo por ID
PUT    /emprestimos/:id              - Renova empréstimo
DELETE /emprestimos/:id              - Devolve livro

GET    /reservas                     - Lista reservas
POST   /reservas                     - Cria nova reserva
GET    /reservas/:id                 - Obtém reserva por ID
DELETE /reservas/:id                 - Cancela reserva
GET    /health                       - Health check do serviço
```

**Exemplo de Resposta (POST /emprestimos):**
```json
{
  "id": "10",
  "usuario_id": "1",
  "livro_id": "5",
  "data_emprestimo": "2024-01-20T14:00:00Z",
  "data_devolucao_prevista": "2024-02-03T23:59:59Z",
  "status": "ativo"
}
```

### Multas (3004)

```
GET    /multas                       - Lista multas
POST   /multas                       - Cria multa
GET    /multas/:id                   - Obtém multa por ID
PUT    /multas/:id                   - Atualiza multa (pagamento)
DELETE /multas/:id                   - Deleta multa
GET    /health                       - Health check do serviço
```

**Exemplo de Resposta (GET /multas):**
```json
[
  {
    "id": "1",
    "emprestimo_id": "10",
    "usuario_id": "1",
    "valor": 25.50,
    "motivo": "Atraso de 5 dias",
    "data_geracao": "2024-02-04T08:00:00Z",
    "status": "pendente"
  }
]
```

### Notificações (3005)

```
POST   /notificacoes/email           - Envia email
POST   /notificacoes/sms             - Envia SMS
GET    /health                       - Health check do serviço
```

**Exemplo de Requisição (POST /notificacoes/email):**
```json
{
  "usuario_id": "1",
  "tipo": "confirmacao_emprestimo",
  "dados": {
    "livro_titulo": "Clean Code",
    "data_devolucao": "2024-02-03"
  }
}
```

---

## 🗄️ Banco de Dados

### Arquitetura de Dados

Cada serviço possui seu próprio banco de dados PostgreSQL independente:

- **usuarios_db** - Usuários da biblioteca
- **livros_db** - Catálogo de livros
- **emprestimos_db** - Empréstimos e reservas
- **multas_db** - Multas por atraso

### Tabelas Principais

#### Tabela: usuarios

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  endereco TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);
```

#### Tabela: livros

```sql
CREATE TABLE livros (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  isbn VARCHAR(13) UNIQUE,
  quantidade INT DEFAULT 1,
  quantidade_disponivel INT DEFAULT 1,
  ano_publicacao INT,
  categoria VARCHAR(100),
  descricao TEXT,
  data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: emprestimos

```sql
CREATE TABLE emprestimos (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  livro_id INT NOT NULL,
  data_emprestimo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_devolucao_prevista TIMESTAMP NOT NULL,
  data_devolucao_real TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ativo',
  renovacoes INT DEFAULT 0
);
```

#### Tabela: reservas

```sql
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  livro_id INT NOT NULL,
  data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  posicao_fila INT,
  status VARCHAR(50) DEFAULT 'ativa'
);
```

#### Tabela: multas

```sql
CREATE TABLE multas (
  id SERIAL PRIMARY KEY,
  emprestimo_id INT NOT NULL,
  usuario_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  motivo VARCHAR(255),
  data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_pagamento TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pendente'
);
```

### Inicialização do Banco

Os scripts SQL de inicialização estão em `sql/init.sql` de cada serviço e são executados automaticamente ao iniciar os containers.

---

## 🚀 Deployment

### Render.com

A aplicação está configurada para deploy no Render.com:

```yaml
# render.yaml contém configuração de:
- 6 serviços Web (1 gateway + 5 microsserviços)
- 4 bancos de dados PostgreSQL
- Variáveis de ambiente
- Health checks
- Auto-restart políticas
```

> **ℹ️ Hibernação no Plano Gratuito:** No plano gratuito do Render, os serviços entram em modo de hibernação após período de inatividade. O API Gateway está configurado com **5 tentativas automáticas de retry** para lidar com o tempo de boot (~30s) dos microsserviços, evitando erros 502 imediatos para o usuário.

**Deploy:**
```bash
git push  # Deploy automático via Render
```

### Railway.app

Alternativa com configuração em `railway.json`:

```bash
# Login no Railway
railway login

# Deploy
railway up
```

### Docker Hub

Cada serviço possua um Dockerfile para build de imagens:

```bash
# Build da imagem
docker build -t biblioteca-api-gateway ./api-gateway
docker build -t biblioteca-usuarios ./servico-usuarios
# ... etc

# Push para Docker Hub
docker push seu-usuario/biblioteca-api-gateway
```

---

## 📊 Fluxo de Dados

### Exemplo: Criar Empréstimo

```
1. Cliente faz requisição ao Gateway
   POST http://localhost:3000/emprestimos
   {
     "usuario_id": 1,
     "livro_id": 5
   }

2. Gateway roteia para Serviço de Empréstimos
   POST http://servico-emprestimos:3003/emprestimos

3. Serviço de Empréstimos:
   a) Valida dados com Serviço de Usuários
      GET http://servico-usuarios:3001/usuarios/1
   
   b) Verifica disponibilidade com Serviço de Livros
      GET http://servico-livros:3002/livros/5
   
   c) Cria registro no banco de dados
   
   d) Envia notificação via Serviço de Notificações
      POST http://servico-notificacoes:3005/notificacoes

4. Resposta retorna ao cliente
   {
     "id": 10,
     "usuario_id": 1,
     "livro_id": 5,
     "status": "ativo"
   }
```

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch (re-executa ao alterar arquivos)
npm run test:watch

# Com cobertura de código
npm run test:cov
```

---

## 📝 Design Patterns Utilizados

### 1. **Singleton Pattern**

Utilizado na classe `LibraryManager` para garantir apenas uma instância gerenciando empréstimos/reservas.

```javascript
// servico-emprestimos/src/core/libraryManager.js
class LibraryManager {
  static instance = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new LibraryManager();
    }
    return this.instance;
  }
}
```

### 2. **Facade Pattern**
API Gateway atua como facade, simplificando a comunicação com múltiplos serviços.

### 3. **Repository Pattern**
Serviços utilizam repositories para abstrair acesso a dados.

### 4. **Error Handler Middleware**
Tratamento centralizado de erros com middleware.

### 5. **Retry Pattern**
O API Gateway implementa o padrão de Retry para tolerância a falhas transitórias. Utiliza `axios-retry` para retentar automaticamente chamadas que falham com erros de servidor (502/503/504) ou de rede, cobrindo o tempo de boot dos microsserviços no Render.

```javascript
// api-gateway/src/middlewares/proxy.js
axiosRetry(client, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    !error.response || [502, 503, 504].includes(error.response.status),
});
```

---

## 🔐 Segurança

### Implementado

- ✅ CORS configurado para frontend específico
- ✅ Validação de entrada com Zod
- ✅ Error handling centralizado
- ✅ Health checks para detecção de falhas

### Recomendações

- ⚠️ Implementar JWT/OAuth para autenticação
- ⚠️ Usar HTTPS em produção
- ⚠️ Adicionar rate limiting
- ⚠️ Implementar validação de autorização
- ⚠️ Usar variáveis de ambiente para secrets

---

## 📚 Recursos Adicionais

- **GitHub:** https://github.com/ViniciuSetorio/biblioteca-api
- **Frontend:** https://bibton.vercel.app
- **Documentação API:** Swagger UI (quando configurado)
- **Diagrama de Arquitetura:** [Diagramas/diagrama-arquitetura.html](Diagramas/diagrama-arquitetura.html)

---

## 👥 Contribuidores

- Trabalho de Engenharia de Software II
- Orientador: [Professor/Orientador]
- Ano: 2026

---

## 📄 Licença

ISC - [Licença ISC](LICENSE)

---

## 💬 Suporte

Para dúvidas ou problemas:
1. Abra uma issue no GitHub
2. Verifique a documentação de cada serviço
3. Consulte os logs dos containers: `docker-compose logs -f [service]`

---

**Desenvolvido com ❤️ para gerenciar bibliotecas de forma eficiente e escalável.**
