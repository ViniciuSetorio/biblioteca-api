import { Pool } from "pg";

let poolInstance;

function createPool() {
  return new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });
}

export default function getDatabase() {
  if (!poolInstance) {
    poolInstance = createPool();
  }

  return poolInstance;
}
