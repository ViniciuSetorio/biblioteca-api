import { Pool } from "pg";

let poolInstance;

function createPool() {
  // Configuração para produção (Neon/Render)
  if (process.env.DATABASE_URL) {
    console.log("Configurando pool com DATABASE_URL");
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // OBRIGATÓRIO para Neon/Render
      },
      // Timeouts para evitar conexões pendentes
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
  }

  // Configuração para desenvolvimento local (Docker/compose)
  console.log("Configurando pool para desenvolvimento local");
  return new Pool({
    user: process.env.PGUSER || "postgres",
    host: process.env.PGHOST || "postgres_usuarios",
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