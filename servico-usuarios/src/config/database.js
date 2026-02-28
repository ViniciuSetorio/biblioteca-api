import { Pool } from "pg";

let poolInstance;

function createPool() {
  // Configuração para produção (Neon/Render)
  if (process.env.DATABASE_URL) {
    const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@");
    console.log(`Configurando pool com DATABASE_URL: ${maskedUrl}`);

    // Verificar se o hostname é o literal "base" (causa comum de ENOTFOUND base)
    if (
      process.env.DATABASE_URL.includes("@base:") ||
      process.env.DATABASE_URL.includes("@base/")
    ) {
      console.warn(
        "⚠️ ALERTA: DATABASE_URL parece conter o hostname 'base'. Verifique as variáveis de ambiente no Render!",
      );
    }

    // ATENÇÃO: Se DATABASE_URL existir, ignoramos COMPLETAMENTE as variáveis PG... do Render
    // Isso evita conflitos se o Render injetar variáveis padrão
    const pgVars = ["PGHOST", "PGUSER", "PGDATABASE", "PGPASSWORD", "PGPORT"];
    pgVars.forEach((v) => delete process.env[v]);

    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // OBRIGATÓRIO para Neon/Render
      },
      // Timeouts para evitar conexões pendentes
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
  }

  // Configuração para desenvolvimento local (Docker/compose)
  const host = process.env.PGHOST || "postgres_usuarios";
  console.log(`Configurando pool para desenvolvimento local (Host: ${host})`);
  return new Pool({
    user: process.env.PGUSER || "postgres",
    host: host,
    database: process.env.PGDATABASE || "usuarios_db",
    password: process.env.PGPASSWORD || "postgres",
    port: process.env.PGPORT || 5432,
    // Timeout menor para desenvolvimento
    connectionTimeoutMillis: 3000,
  });
}

export default function getDatabase() {
  if (!poolInstance) {
    try {
      poolInstance = createPool();
      
      // Teste de conexão assíncrono (não bloqueia a inicialização)
      poolInstance.connect((err, client, release) => {
        if (err) {
          console.error("Erro ao conectar ao banco:", err.message);
          if (process.env.NODE_ENV === 'production') {
            // Em produção, queremos saber do erro mas não derrubar a app
            console.error("Aplicação continuando mesmo com erro no banco");
          }
        } else {
          console.log("Banco de dados conectado com sucesso!");
          release();
        }
      });
      
    } catch (error) {
      console.error("Erro ao criar pool de conexão:", error.message);
      throw error; // Em desenvolvimento, pode querer parar a app
    }
  }
  return poolInstance;
}