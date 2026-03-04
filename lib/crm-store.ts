import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

export type Contact = { id: string; firstName?: string; lastName?: string; email?: string; phone?: string; company?: string; title?: string; leadSource?: string; status?: string; tags?: string[]; notes?: string; createdAt: string; updatedAt: string; };
export type Deal = { id: string; name?: string; contactId?: string; company?: string; stage: string; value?: number; probability?: number; expectedCloseDate?: string; nextStep?: string; lastActivityAt?: string; notes?: string; createdAt: string; updatedAt: string; };
export type Task = { id: string; title: string; relatedType?: "contact" | "deal"; relatedId?: string; dueDate?: string; done: boolean; notes?: string; createdAt: string; updatedAt: string; };
export type GmailMessage = { id: string; threadId?: string; from?: string; to?: string; subject?: string; date?: string; snippet?: string; };

type CrmStore = { contacts: Contact[]; deals: Deal[]; tasks: Task[]; gmail: { connectedAt?: string; messages: GmailMessage[]; tokens?: { access_token?: string; refresh_token?: string; expiry_date?: number; }; }; };

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "crm.json");
const initialStore: CrmStore = { contacts: [], deals: [], tasks: [], gmail: { messages: [] } };

export const CONTACT_STAGES = ["New", "Attempting", "Connected", "Discovery meeting booked", "Not right now"] as const;

export const DEAL_STAGES = ["Discovery meeting booked", "90-minute booked", "90-minute complete", "Verbal Yes", "Client signed (won)", "Lost"] as const;

const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;
let schemaReady = false;

async function ensureSchema() {
  if (!pool || schemaReady) return;
  await pool.query(`
    create table if not exists crm_contacts (
      id text primary key,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create table if not exists crm_deals (
      id text primary key,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create table if not exists crm_tasks (
      id text primary key,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create table if not exists crm_meta (
      key text primary key,
      data jsonb not null,
      updated_at timestamptz default now()
    );
  `);
  schemaReady = true;
}

async function getStorePg(): Promise<CrmStore> {
  if (!pool) throw new Error("No database");
  await ensureSchema();
  const [contactsQ, dealsQ, tasksQ, gmailQ] = await Promise.all([
    pool.query("select data from crm_contacts order by updated_at desc"),
    pool.query("select data from crm_deals order by updated_at desc"),
    pool.query("select data from crm_tasks order by updated_at desc"),
    pool.query("select data from crm_meta where key='gmail' limit 1"),
  ]);
  const gmailData = gmailQ.rows[0]?.data || { messages: [] };
  return {
    contacts: contactsQ.rows.map((r: any) => r.data),
    deals: dealsQ.rows.map((r: any) => r.data),
    tasks: tasksQ.rows.map((r: any) => r.data),
    gmail: { ...gmailData, messages: gmailData.messages || [] },
  };
}

async function saveStorePg(store: CrmStore) {
  if (!pool) throw new Error("No database");
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("truncate crm_contacts, crm_deals, crm_tasks");
    for (const c of store.contacts) {
      await client.query("insert into crm_contacts (id, data, updated_at) values ($1,$2,now())", [c.id, c]);
    }
    for (const d of store.deals) {
      await client.query("insert into crm_deals (id, data, updated_at) values ($1,$2,now())", [d.id, d]);
    }
    for (const t of store.tasks) {
      await client.query("insert into crm_tasks (id, data, updated_at) values ($1,$2,now())", [t.id, t]);
    }
    await client.query(
      "insert into crm_meta (key, data, updated_at) values ('gmail', $1, now()) on conflict (key) do update set data=excluded.data, updated_at=now()",
      [store.gmail]
    );
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

async function getStoreFile(): Promise<CrmStore> {
  await mkdir(dataDir, { recursive: true });
  try {
    const parsed = JSON.parse(await readFile(dbPath, "utf8")) as CrmStore;
    return { ...initialStore, ...parsed, gmail: { ...initialStore.gmail, ...(parsed.gmail || {}), messages: parsed.gmail?.messages || [] } };
  } catch {
    await writeFile(dbPath, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
}

async function saveStoreFile(store: CrmStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(store, null, 2));
}

export async function getStore(): Promise<CrmStore> {
  if (pool) return getStorePg();
  return getStoreFile();
}

export async function saveStore(store: CrmStore) {
  if (pool) return saveStorePg(store);
  return saveStoreFile(store);
}

export const id = () => Math.random().toString(36).slice(2, 10);
export const now = () => new Date().toISOString();
export const storageMode = () => (pool ? "postgres" : "file");
