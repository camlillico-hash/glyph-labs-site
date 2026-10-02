function firstNonEmpty(values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function getCrmDatabaseUrl() {
  const connectionString = firstNonEmpty([
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
  ]);
  if (!connectionString || !process.env.VERCEL) return connectionString;

  // Serverless instances should release their database session after each transaction.
  // Supavisor uses 5432 for session pooling and 6543 for transaction pooling.
  try {
    const url = new URL(connectionString);
    if (url.hostname.endsWith(".pooler.supabase.com") && (url.port === "5432" || !url.port)) {
      url.port = "6543";
      return url.toString();
    }
  } catch {
    // Keep the configured string if it is not a parseable URL.
  }
  return connectionString;
}
