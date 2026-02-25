import { Pool } from "pg";

let poolInstance;

function createPool() {
  return new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'postgres_multas',
    database: process.env.PGDATABASE || 'multas_db',
    password: process.env.PGPASSWORD || 'secret',
    port: process.env.PGPORT || 5432,
  });
}

export default function getDatabase() {
  if (!poolInstance) {
    poolInstance = createPool();
  }
  return poolInstance;
}