import { Pool } from "pg";

export function getCrmPool() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) return null;
  return new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
}
