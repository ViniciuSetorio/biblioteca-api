# 📊 Tabela de Levantamento de Funcionalidades Críticas

## Pergunta Principal

> *"Se essa funcionalidade falhar, o sistema quebra ou gera grande impacto?"*

---

## Tabela de Criticidade

| Criticidade | Funcionalidade | Justificativa |
| :--- | :--- | :--- |
| **CRÍTICA** | **API Gateway (Roteamento & Retry)** | É o ponto de entrada único. Se falhar, **todo o sistema fica inacessível** para o frontend, independentemente dos microsserviços estarem saudáveis. |
| **CRÍTICA** | **Serviço de Empréstimos (Criação & Devolução)** | É o **core business** da biblioteca. Sem empréstimos, o sistema perde seu propósito principal. Falha impede a operação fundamental de empréstimo/devolução. |
| **CRÍTICA** | **Serviço de Livros (Catálogo & Disponibilidade)** | O catálogo é a base de dados essencial. Sem ele, não há o que emprestar. Falha impede consultas e validações de disponibilidade para empréstimos. |
| **CRÍTICA** | **Serviço de Usuários (Cadastro & Validação)** | Usuários são necessários para realizar empréstimos. Falha impede autenticação e validação de quem está realizando operações. |
| **ALTA** | **Serviço de Multas (Cálculo & Pagamento)** | Impacta diretamente o **controle financeiro** e a **integridade dos dados**. Falha pode resultar em perda de receita e inconsistência no status de empréstimos. |
| **ALTA** | **Serviço de Empréstimos (Reservas)** | Gerencia a fila de espera e a experiência do usuário. Falha causa **impacto operacional** significativo na gestão de demanda por livros populares. |
| **MÉDIA** | **Serviço de Notificações (Email/SMS)** | É um serviço **assíncrono e secundário**. Falha não impede operações principais, mas degrada a experiência do usuário (alertas de vencimento, confirmações). |
| **BAIXA** | **Health Checks (Monitoramento)** | Essencial para **observabilidade**, mas sua falha não impacta diretamente as operações em produção. Afeta apenas a capacidade de diagnóstico. |

---

## Resumo por Nível de Criticidade

| Nível | Quantidade | Funcionalidades |
| :--- | :--- | :--- |
| 🔴 **Crítica** | 4 | API Gateway, Empréstimos, Livros, Usuários |
| 🟠 **Alta** | 2 | Multas, Reservas |
| 🟡 **Média** | 1 | Notificações |
| 🟢 **Baixa** | 1 | Health Checks |
