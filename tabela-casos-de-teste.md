# 📋 Tabela de Casos de Teste - Biblioteca API

**Total de Casos de Teste:** 98
**Cobertura:** 100% das rotas da aplicação

---

## 1. Serviço de Usuários (17 testes)

| ID   | Funcionalidade        | Entrada                                           | Resultado Esperado                                                                                         | Tipo de Teste |
| ---- | --------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------- |
| CT01 | Cadastrar Usuário     | Usuário válido com cargo "membro"                 | 201 Created - Usuário criado com ID e created_at                                                           | Funcional     |
| CT02 | Cadastrar Usuário     | Usuário válido com cargo "bibliotecario"          | 201 Created - Usuário criado com ID e created_at                                                           | Funcional     |
| CT03 | Cadastrar Usuário     | Email já cadastrado                               | 409 Conflict - Mensagem "Email já cadastrado", code: EMAIL_ALREADY_EXISTS                                  | Integração    |
| CT04 | Cadastrar Usuário     | Cargo inválido ("admin")                          | 400 Bad Request - Mensagem "Cargo inválido", code: INVALID_ROLE                                            | Validação     |
| CT05 | Buscar Usuário por ID | ID válido existente                               | 200 OK - Dados completos do usuário (id, nome, email, cargo, created_at)                                   | Funcional     |
| CT06 | Buscar Usuário por ID | ID inexistente (99999)                            | 404 Not Found - Mensagem "não encontrado", code: USER_NOT_FOUND                                            | Validação     |
| CT07 | Listar Usuários       | Nenhum usuário cadastrado                         | 200 OK - Array vazio []                                                                                    | Funcional     |
| CT08 | Listar Usuários       | Múltiplos usuários cadastrados                    | 200 OK - Array com usuários ordenados por nome                                                             | Funcional     |
| CT09 | Atualizar Usuário     | Novo nome válido                                  | 200 OK - Usuário com nome atualizado                                                                       | Funcional     |
| CT10 | Atualizar Usuário     | Novo email válido                                 | 200 OK - Usuário com email atualizado                                                                      | Funcional     |
| CT11 | Atualizar Usuário     | Novo cargo válido (membro → bibliotecario)        | 200 OK - Usuário com cargo atualizado                                                                      | Funcional     |
| CT12 | Atualizar Usuário     | Múltiplos campos simultaneamente                  | 200 OK - Usuário com todos os campos atualizados                                                           | Funcional     |
| CT13 | Atualizar Usuário     | ID inexistente (99999)                            | 404 Not Found - Mensagem "não encontrado", code: USER_NOT_FOUND                                            | Validação     |
| CT14 | Atualizar Usuário     | Email duplicado (já cadastrado por outro usuário) | 409 Conflict - Mensagem "Email já cadastrado", code: EMAIL_ALREADY_EXISTS                                  | Integração    |
| CT15 | Deletar Usuário       | ID válido existente                               | 200 OK - Dados do usuário removido. GET subsequente retorna 404                                            | Funcional     |
| CT16 | Deletar Usuário       | ID inexistente (99999)                            | 404 Not Found - Mensagem "não encontrado", code: USER_NOT_FOUND                                            | Validação     |
| CT17 | Deletar Usuário       | Usuário com empréstimos ativos                    | 409 Conflict - Mensagem "empréstimos ativos", code: USER_HAS_ACTIVE_LOANS (ou 200 se serviço indisponível) | Integração    |

---

## 2. Serviço de Livros (14 testes)

| ID   | Funcionalidade      | Entrada                                                | Resultado Esperado                                                                          | Tipo de Teste |
| ---- | ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------- |
| CT18 | Cadastrar Livro     | Livro válido com ISBN único e criado_por bibliotecário | 201 Created - Livro criado com ID e created_at                                              | Funcional     |
| CT19 | Cadastrar Livro     | Livro sem criado_por (campo opcional)                  | 201 Created - Livro criado com sucesso                                                      | Funcional     |
| CT20 | Cadastrar Livro     | ISBN duplicado                                         | 409 Conflict - Mensagem "ISBN", code: DUPLICATE_ISBN                                        | Integração    |
| CT21 | Listar Livros       | Nenhum livro cadastrado                                | 200 OK - Array vazio []                                                                     | Funcional     |
| CT22 | Listar Livros       | Múltiplos livros cadastrados                           | 200 OK - Array com livros ordenados por título                                              | Funcional     |
| CT23 | Buscar Livro por ID | ID válido existente                                    | 200 OK - Dados completos do livro (id, titulo, autor, isbn, copias_disponiveis, criado_por) | Funcional     |
| CT24 | Buscar Livro por ID | ID inexistente (99999)                                 | 404 Not Found - Mensagem "não encontrado", code: BOOK_NOT_FOUND                             | Validação     |
| CT25 | Atualizar Livro     | Novo título válido                                     | 200 OK - Livro com título atualizado                                                        | Funcional     |
| CT26 | Atualizar Livro     | Novo autor válido                                      | 200 OK - Livro com autor atualizado                                                         | Funcional     |
| CT27 | Atualizar Livro     | Novo número de cópias                                  | 200 OK - Livro com copias_disponiveis atualizado                                            | Funcional     |
| CT28 | Atualizar Livro     | Múltiplos campos simultaneamente                       | 200 OK - Livro com todos os campos atualizados                                              | Funcional     |
| CT29 | Atualizar Livro     | ID inexistente (99999)                                 | 404 Not Found - Mensagem "não encontrado", code: BOOK_NOT_FOUND                             | Validação     |
| CT30 | Deletar Livro       | ID válido existente                                    | 200 OK - Dados do livro removido. GET subsequente retorna 404                               | Funcional     |
| CT31 | Deletar Livro       | ID inexistente (99999)                                 | 404 Not Found - Mensagem "não encontrado", code: BOOK_NOT_FOUND                             | Validação     |

---

## 3. Serviço de Empréstimos (13 testes)

| ID   | Funcionalidade          | Entrada                                             | Resultado Esperado                                                                            | Tipo de Teste |
| ---- | ----------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------- |
| CT32 | Criar Empréstimo        | Dados válidos (usuário e livro existem, há cópias)  | 201 Created - Empréstimo criado com status "ativo", data_emprestimo e data_prevista_devolucao | Funcional     |
| CT33 | Criar Empréstimo        | Livro sem cópias disponíveis (copias_disponiveis=0) | 409 Conflict - Mensagem "cópia", code: NO_AVAILABLE_COPIES                                    | Resiliência   |
| CT34 | Criar Empréstimo        | Usuário inexistente (ID 9999)                       | 404 Not Found - Mensagem "Usuário", code: USER_NOT_FOUND                                      | Validação     |
| CT35 | Devolver Empréstimo     | Empréstimo ativo existente                          | 200 OK - Empréstimo com status "devolvido" e data_devolucao preenchida                        | Funcional     |
| CT36 | Devolver Empréstimo     | Empréstimo já devolvido                             | 409 Conflict - Mensagem "finalizado", code: LOAN_ALREADY_FINISHED                             | Resiliência   |
| CT37 | Listar Empréstimos      | Filtro status=ativo                                 | 200 OK - Array contendo apenas empréstimos com status "ativo"                                 | Funcional     |
| CT38 | Listar Empréstimos      | Sem filtros                                         | 200 OK - Array com todos os empréstimos cadastrados                                           | Funcional     |
| CT39 | Obter Empréstimo por ID | ID válido existente                                 | 200 OK - Dados completos do empréstimo                                                        | Funcional     |
| CT40 | Obter Empréstimo por ID | ID inexistente (99999)                              | 404 Not Found - Mensagem "não encontrado", code: LOAN_NOT_FOUND                               | Validação     |
| CT41 | Atualizar Empréstimo    | Dados válidos (novo status)                         | 200 OK - Empréstimo com status atualizado                                                     | Funcional     |
| CT42 | Atualizar Empréstimo    | ID inexistente (99999)                              | 404 Not Found - Mensagem "não encontrado", code: LOAN_NOT_FOUND                               | Validação     |
| CT43 | Deletar Empréstimo      | ID válido existente                                 | 204 No Content. GET subsequente retorna 404                                                   | Funcional     |
| CT44 | Deletar Empréstimo      | ID inexistente (99999)                              | 404 Not Found - Mensagem "não encontrado", code: LOAN_NOT_FOUND                               | Validação     |

---

## 4. Serviço de Reservas (12 testes)

| ID   | Funcionalidade            | Entrada                                   | Resultado Esperado                                                                                   | Tipo de Teste |
| ---- | ------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| CT45 | Criar Reserva             | Livro indisponível (copias_disponiveis=0) | 201 Created - Reserva criada com status "ativa", data_reserva e data_expiracao                       | Funcional     |
| CT46 | Criar Reserva             | Livro disponível (copias_disponiveis>0)   | 409 Conflict - Mensagem "disponível", code: BOOK_AVAILABLE                                           | Resiliência   |
| CT47 | Listar Reservas           | Nenhuma reserva cadastrada                | 200 OK - Array vazio []                                                                              | Funcional     |
| CT48 | Listar Reservas           | Filtro status=ativa                       | 200 OK - Array contendo apenas reservas com status "ativa"                                           | Funcional     |
| CT49 | Listar Reservas           | Filtro usuarioId=1                        | 200 OK - Array contendo apenas reservas do usuário 1                                                 | Funcional     |
| CT50 | Listar Reservas           | Filtro livroId=1                          | 200 OK - Array contendo apenas reservas do livro 1                                                   | Funcional     |
| CT51 | Obter Reserva por ID      | ID válido existente                       | 200 OK - Dados completos da reserva (id, usuario_id, livro_id, status, data_reserva, data_expiracao) | Funcional     |
| CT52 | Obter Reserva por ID      | ID inexistente (99999)                    | 404 Not Found - Mensagem "não encontrada", code: RESERVATION_NOT_FOUND                               | Validação     |
| CT53 | Cancelar Reserva (DELETE) | ID válido existente                       | 200 OK - Reserva com status "cancelada"                                                              | Funcional     |
| CT54 | Cancelar Reserva (DELETE) | ID inexistente (99999)                    | 404 Not Found - Mensagem "não encontrada", code: RESERVATION_NOT_FOUND                               | Validação     |
| CT55 | Cancelar Reserva (PATCH)  | Reserva ativa existente                   | 200 OK - Reserva com status "cancelada"                                                              | Funcional     |
| CT56 | Cancelar Reserva (PATCH)  | Reserva já cancelada                      | 409 Conflict - Mensagem "não está ativa", code: RESERVATION_NOT_ACTIVE                               | Resiliência   |

---

## 5. Serviço de Multas (14 testes)

| ID   | Funcionalidade     | Entrada                                 | Resultado Esperado                                                              | Tipo de Teste |
| ---- | ------------------ | --------------------------------------- | ------------------------------------------------------------------------------- | ------------- |
| CT57 | Criar Multa        | Empréstimo atrasado (ID 1, valor 10.00) | 201 Created - Multa criada com valor > 0, pago=false                            | Funcional     |
| CT58 | Criar Multa        | Empréstimo no prazo (ID 2, valor 0.01)  | 201 Created - Multa criada com valor pequeno (0 < valor < 1)                    | Funcional     |
| CT59 | Listar Multas      | Sem filtros                             | 200 OK - Array com todas as multas cadastradas                                  | Funcional     |
| CT60 | Listar Multas      | Filtro pago=true                        | 200 OK - Array contendo apenas multas pagas                                     | Funcional     |
| CT61 | Obter Multa por ID | ID válido existente                     | 200 OK - Dados completos da multa (id, emprestimos_id, valor, pago, created_at) | Funcional     |
| CT62 | Obter Multa por ID | ID inexistente (99999)                  | 404 Not Found - Mensagem "não encontrada", code: FINE_NOT_FOUND                 | Validação     |
| CT63 | Atualizar Multa    | Dados válidos (novo valor)              | 200 OK - Multa com valor atualizado                                             | Funcional     |
| CT64 | Atualizar Multa    | ID inexistente (99999)                  | 404 Not Found - Mensagem "não encontrada", code: FINE_NOT_FOUND                 | Validação     |
| CT65 | Deletar Multa      | ID válido existente                     | 204 No Content. GET subsequente retorna 404                                     | Funcional     |
| CT66 | Deletar Multa      | ID inexistente (99999)                  | 404 Not Found - Mensagem "não encontrada", code: FINE_NOT_FOUND                 | Validação     |
| CT67 | Pagar Multa        | Multa não paga existente                | 200 OK - Multa com pago=true e data_pagamento preenchida                        | Funcional     |
| CT68 | Pagar Multa        | Multa com valor decimal (25.50)         | 200 OK - Multa paga com valor correto                                           | Funcional     |
| CT69 | Pagar Multa        | Multa já paga                           | 409 Conflict - Mensagem "paga", code: FINE_ALREADY_PAID                         | Resiliência   |
| CT70 | Pagar Multa        | ID inexistente (99999)                  | 404 Not Found - Mensagem "não encontrada", code: FINE_NOT_FOUND                 | Validação     |

---

## 6. Serviço de Notificações (8 testes)

| ID   | Funcionalidade     | Entrada                                                    | Resultado Esperado                                              | Tipo de Teste |
| ---- | ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------- | ------------- |
| CT71 | Enviar Notificação | Dados válidos (tipo "emprestimo", usuarioId, emprestimoId) | 202 Accepted - Mensagem "Notificação processada", tipo e status | Funcional     |
| CT72 | Enviar Notificação | Tipo inválido ("tipo_inexistente")                         | 400 Bad Request - Erro "Dados inválidos"                        | Validação     |
| CT73 | Enviar Email       | Dados válidos para email                                   | 202 Accepted - Mensagem "Notificação por email processada"      | Funcional     |
| CT74 | Enviar Email       | Tipo inválido para email                                   | 400 Bad Request - Erro "Dados inválidos"                        | Validação     |
| CT75 | Enviar SMS         | Dados válidos (tipo, usuarioId, emprestimoId, telefone)    | 202 Accepted - Mensagem "Notificação por SMS processada"        | Funcional     |
| CT76 | Enviar SMS         | SMS sem telefone                                           | 400 Bad Request - Erro "Dados inválidos"                        | Validação     |
| CT77 | Status da Fila     | Requisição GET /notificacoes/fila                          | 200 OK - Objeto com "tamanho" (number) e "notificacoes" (array) | Configuração  |
| CT78 | Enviar Email       | Usuário inexistente (ID 9999)                              | 202 Accepted - Notificação processada com dados parciais        | Funcional     |

---

## 7. API Gateway (20 testes)

| ID   | Funcionalidade                     | Entrada                                        | Resultado Esperado                                           | Tipo de Teste |
| ---- | ---------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------- |
| CT79 | Health Check                       | Requisição GET /health                         | 200 OK - status: "healthy", retryConfig, timestamp, services | Configuração  |
| CT80 | Serviço Indisponível               | Requisição para serviço offline (ECONNREFUSED) | 504 Gateway Timeout - error: "Gateway Error", code e message | Resiliência   |
| G2   | Proxy Livros - Listar              | GET /livros via Gateway                        | 200 OK - Array com livros do serviço mock                    | Integração    |
| G2   | Proxy Livros - Buscar              | GET /livros/1 via Gateway                      | 200 OK - Dados do livro do serviço mock                      | Integração    |
| G2   | Proxy Livros - Criar               | POST /livros via Gateway                       | 201 Created - Livro criado no serviço mock                   | Integração    |
| G3   | Proxy Empréstimos - Listar         | GET /emprestimos via Gateway                   | 200 OK - Array com empréstimos do serviço mock               | Integração    |
| G3   | Proxy Empréstimos - Buscar         | GET /emprestimos/1 via Gateway                 | 200 OK - Dados do empréstimo do serviço mock                 | Integração    |
| G3   | Proxy Empréstimos - Criar          | POST /emprestimos via Gateway                  | 201 Created - Empréstimo criado no serviço mock              | Integração    |
| G3   | Proxy Empréstimos - Devolver       | PATCH /emprestimos/1/devolucao via Gateway     | 200 OK - Empréstimo com status "devolvido"                   | Integração    |
| G4   | Proxy Reservas - Listar            | GET /reservas via Gateway                      | 200 OK - Array com reservas do serviço mock                  | Integração    |
| G4   | Proxy Reservas - Buscar            | GET /reservas/1 via Gateway                    | 200 OK - Dados da reserva do serviço mock                    | Integração    |
| G4   | Proxy Reservas - Criar             | POST /reservas via Gateway                     | 201 Created - Reserva criada no serviço mock                 | Integração    |
| G4   | Proxy Reservas - Cancelar (PATCH)  | PATCH /reservas/1/cancelar via Gateway         | 200 OK - Reserva com status "cancelada"                      | Integração    |
| G4   | Proxy Reservas - Cancelar (DELETE) | DELETE /reservas/1 via Gateway                 | 200 OK - Reserva com status "cancelada"                      | Integração    |
| G5   | Proxy Multas - Listar              | GET /multas via Gateway                        | 200 OK - Array com multas do serviço mock                    | Integração    |
| G5   | Proxy Multas - Buscar              | GET /multas/1 via Gateway                      | 200 OK - Dados da multa do serviço mock                      | Integração    |
| G5   | Proxy Multas - Criar               | POST /multas via Gateway                       | 201 Created - Multa criada no serviço mock                   | Integração    |
| G5   | Proxy Multas - Pagar               | PATCH /multas/1/pagar via Gateway              | 200 OK - Multa com pago=true                                 | Integração    |
| G5   | Proxy Multas - Atualizar           | PUT /multas/1 via Gateway                      | 200 OK - Multa com valor atualizado                          | Integração    |
| G5   | Proxy Multas - Deletar             | DELETE /multas/1 via Gateway                   | 204 No Content                                               | Integração    |

---

## Resumo Geral

| Serviço      | Testes | Cobertura              |
| ------------ | ------ | ---------------------- |
| Usuários     | 17     | 100% (5/5 rotas)       |
| Livros       | 14     | 100% (5/5 rotas)       |
| Empréstimos  | 13     | 100% (6/6 rotas)       |
| Reservas     | 12     | 100% (5/5 rotas)       |
| Multas       | 14     | 100% (6/6 rotas)       |
| Notificações | 8      | 100% (4/4 rotas)       |
| API Gateway  | 20     | 100% (6/6 rotas)       |
| **Total**    | **98** | **100% (37/37 rotas)** |

---

## Tipos de Teste Utilizados (Reclassificado)

| Tipo             | Descrição                                                                                     | Quantidade |
| ---------------- | --------------------------------------------------------------------------------------------- | ---------- |
| **Funcional**    | Validação de regras de negócio e comportamento esperado (CRUD, filtros, transições de estado) | 22         |
| **Integração**   | Testes com banco de dados real (Testcontainers) e integração entre múltiplos serviços         | 52         |
| **Validação**    | Testes de entrada/schema, rejeição de dados inválidos, integridade referencial                | 16         |
| **Resiliência**  | Testes de falhas, retry logic, tratamento de erros, conflitos de estado                       | 6          |
| **Configuração** | Testes de health check, setup e status de serviços                                            | 2          |

---

## Códigos de Erro HTTP Utilizados

| Código | Significado     | Quando Utilizado                                 |
| ------ | --------------- | ------------------------------------------------ |
| 200    | OK              | Operações de leitura e atualização bem-sucedidas |
| 201    | Created         | Criação bem-sucedida de recursos                 |
| 202    | Accepted        | Notificação aceita para processamento assíncrono |
| 204    | No Content      | Exclusão bem-sucedida de recursos                |
| 400    | Bad Request     | Dados de entrada inválidos                       |
| 404    | Not Found       | Recurso não encontrado                           |
| 409    | Conflict        | Conflito de estado (duplicado, já processado)    |
| 504    | Gateway Timeout | Serviço downstream indisponível após retries     |
