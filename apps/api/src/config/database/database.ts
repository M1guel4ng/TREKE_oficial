// apps/api/src/config/database/database.ts
import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function testConnection() {
  const res = await pool.query("SELECT NOW() as now");
  console.log("✅ Conectado a PostgreSQL:", res.rows[0].now);
}

// 🔧 FALTABA: helper de transacciones
export async function withTx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
