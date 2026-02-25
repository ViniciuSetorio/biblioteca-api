import { Pool } from "pg";

let poolInstance;

function createPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // OBRIGATÓRIO para Render
      },
    });
  }

  return new Pool({
    user: process.env.PGUSER || "postgres",
    host: process.env.PGHOST || "postgres_usuarios",
    database: process.env.PGDATABASE || "usuarios_db",
    password: process.env.PGPASSWORD || "postgres",
    port: process.env.PGPORT || 5432,
  });
}

export default function getDatabase() {
  if (!poolInstance) {
    poolInstance = createPool();
  }
  return poolInstance;
}