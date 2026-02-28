import { Pool } from "pg";

let poolInstance;

function createPool() {
  // Configuração para produção (Neon/Render/Railway)
  if (
    process.env.NODE_ENV === "production" ||
    process.env.DATABASE_URL ||
    process.env.MULTAS_DB_URL
  ) {
    const dbUrl = process.env.DATABASE_URL || process.env.MULTAS_DB_URL;
    if (!dbUrl) {
      console.warn(
        "⚠️ DATABASE_URL ou MULTAS_DB_URL não encontrados em ambiente de produção!",
      );
    } else {
      const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
      console.log(`Configurando pool com URL: ${maskedUrl}`);
    }

    // ATENÇÃO: Se a URL existir, ignoramos COMPLETAMENTE as variáveis PG... do Render
    const pgVars = ["PGHOST", "PGUSER", "PGDATABASE", "PGPASSWORD", "PGPORT"];
    pgVars.forEach((v) => delete process.env[v]);

    return new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      // Timeouts para evitar conexões pendentes
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
  }

  // Configuração para desenvolvimento local (Docker/compose)
  const host = process.env.PGHOST || "postgres_multas";
  console.log(`Configurando pool para desenvolvimento local (Host: ${host})`);
  return new Pool({
    user: process.env.PGUSER || "postgres",
    host: host,
    database: process.env.PGDATABASE || "multas_db",
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