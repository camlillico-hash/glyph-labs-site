import { Pool } from "pg";

let pool: Pool | null | undefined;

export function getCrmPool() {
  if (pool !== undefined) return pool;
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    pool = null;
    return pool;
  }
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
  return pool;
}
