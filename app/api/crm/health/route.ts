import { NextResponse } from "next/server";
import { Client } from "pg";
import { getStore } from "@/lib/crm-store";
import { getCrmPool } from "@/lib/crm-db";
import { getCrmDatabaseUrl } from "@/lib/crm-database-url";

export async function GET() {
  const databaseUrl = getCrmDatabaseUrl();
  const result: any = {
    dbConfigured: Boolean(databaseUrl),
    dbConnectOk: false,
    dbError: null,
    storeCounts: null,
    dbTableCounts: null,
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
    const pool = getCrmPool();
    if (pool) {
      const tableCounts = await pool.query(`
        select
          (select count(*)::int from crm_contacts) as contacts,
          (select count(*)::int from crm_deals) as deals,
          (select count(*)::int from crm_tasks) as tasks,
          (select count(*)::int from crm_activities) as activities
      `);
      result.dbTableCounts = tableCounts.rows[0] || null;
    }
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
