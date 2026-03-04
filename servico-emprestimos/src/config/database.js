import { Pool } from "pg";

let poolInstance;

function createPool() {
  const getEnvVar = (v) => {
    const val = process.env[v];
    return val && !val.includes("${") ? val : null;
  };

  const dbUrl = getEnvVar("DATABASE_URL") || getEnvVar("EMPRESTIMOS_DB_URL");

  // Configuração para produção (Neon/Render/Railway)
  if (process.env.NODE_ENV === "production" || dbUrl) {
    if (!dbUrl) {
      console.warn(
        "⚠️ DATABASE_URL ou EMPRESTIMOS_DB_URL não encontrados em ambiente de produção!",
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
  const host = process.env.PGHOST || "postgres_emprestimos";
  console.log(`Configurando pool para desenvolvimento local (Host: ${host})`);
  return new Pool({
    user: process.env.PGUSER || "postgres",
    host: host,
    database: process.env.PGDATABASE || "emprestimos_db",
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

      poolInstance.on("error", (err) => {
        console.error(
          "Erro inesperado no pool do banco de dados:",
          err.message,
        );
      });

      // Teste de conexão assíncrono (não bloqueia a inicialização)
      poolInstance.connect((err, client, release) => {
        if (err) {
          console.error("Erro ao conectar ao banco:", err.message);
          if (
            process.env.NODE_ENV === "production" ||
            process.env.DATABASE_URL
          ) {
            console.error(
              "Aplicação continuando em modo resiliente (sem banco)",
            );
          }
        } else {
          console.log("Banco de dados conectado com sucesso!");
          release();
        }
      });
    } catch (error) {
      console.error("Erro crítico ao criar pool de conexão:", error.message);
      if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL) {
        console.error(
          "Suprimindo erro de inicialização do banco para manter serviço UP",
        );
        return {
          query: () =>
            Promise.reject(
              new Error("Banco de dados indisponível (Erro de Configuração)"),
            ),
          connect: (cb) => cb(new Error("Banco de dados indisponível")),
          on: () => {},
        };
      }
      throw error;
    }
  }
  return poolInstance;
}