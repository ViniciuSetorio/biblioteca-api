import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

pool.on("connect", () => {
  console.log("Conectado ao banco de dados Postgres.");
});

pool.on("error", (err) => {
  console.log("Erro ao conectar ao banco de dados Postgres: ", err);
});