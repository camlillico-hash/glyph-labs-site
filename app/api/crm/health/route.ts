import { NextResponse } from "next/server";
import { Client } from "pg";
import { getStore } from "@/lib/crm-store";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  const result: any = {
    dbConfigured: Boolean(databaseUrl),
    dbConnectOk: false,
    dbError: null,
    storeCounts: null,
  };

  if (databaseUrl) {
    const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query("select 1");
      result.dbConnectOk = true;
    } catch (e: any) {
      result.dbError = e?.message || "unknown db error";
    } finally {
      try {
        await client.end();
      } catch {}
    }
  }

  try {
    const store = await getStore();
    result.storeCounts = {
      contacts: Array.isArray(store.contacts) ? store.contacts.length : 0,
      deals: Array.isArray(store.deals) ? store.deals.length : 0,
      tasks: Array.isArray(store.tasks) ? store.tasks.length : 0,
      activities: Array.isArray(store.activities) ? store.activities.length : 0,
    };
  } catch (e: any) {
    result.storeCounts = { error: e?.message || "store load failed" };
  }

  return NextResponse.json(result);
}
