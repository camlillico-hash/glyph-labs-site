import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

export type Contact = { id: string; firstName?: string; lastName?: string; email?: string; phone?: string; linkedin?: string; company?: string; title?: string; type?: string; leadSource?: string; primaryPain?: "Execution" | "Strategy" | "Culture"; status?: string; strengthTest?: "Yes" | null; disqualificationReason?: "Couldn't connect" | "Went cold" | "Said no" | "Not the right person" | "Shouldn't reach out just yet" | "Done tapping network for now." | "Other"; whatNow?: "Leave them" | "Nurture (future)"; referralCount?: number; nextReachOutAt?: string; seederNotes?: string; tags?: string[]; notes?: string; lastActivityDate?: string; lastActivityType?: string; createdAt: string; updatedAt: string; };
export type Deal = { id: string; name?: string; contactId?: string; company?: string; stage: string; clientStage?: "Launch" | "Active rhythm"; primaryPain?: "Execution" | "Strategy" | "Culture"; leadSource?: string; launchIncluded?: "Yes" | "No"; dailyRate?: number; launchFee?: number; annualFee?: number; value?: number; launchDay1Date?: string; launchDay2Date?: string; launchDay3Date?: string; nextQuarterlyDate?: string; nextAnnualDay1Date?: string; nextAnnualDay2Date?: string; probability?: number; expectedCloseDate?: string; nextStep?: string; lastActivityAt?: string; notes?: string; createdAt: string; updatedAt: string; };
export type Task = { id: string; title: string; type?: "email" | "call" | "text" | "linkedin" | "in_person" | "meeting" | "to_do" | "task_completed"; relatedType?: "contact" | "deal"; relatedId?: string; dueDate?: string; status?: "Overdue" | "Not started" | "Completed" | "Canceled"; followUpForContactId?: string; followUpKind?: "nurture_reactivate"; done: boolean; notes?: string; createdAt: string; updatedAt: string; };
export type GmailMessage = { id: string; threadId?: string; from?: string; to?: string; subject?: string; date?: string; snippet?: string; };
export type Activity = { id: string; contactId: string; type: "email" | "call" | "text" | "linkedin" | "in_person" | "meeting" | "task_completed"; note?: string; occurredAt: string; createdAt: string; updatedAt: string; };

export type DealStamp = { id: string; dealId: string; name?: string; company?: string; contactId?: string; value?: number; wonAt: string; removedAt?: string };
export type ContactStamp = { id: string; contactId: string; name?: string; company?: string; email?: string; wonAt: string; removedAt?: string };

export type TransitionTargets = {
  revenueGoalAnnual: number;
  avgRevenuePerClientAnnual: number;
  targetDate: string;
  convWarmToIntro: number;
  convIntroToDiscovery: number;
  convDiscoveryToWon: number;
};

export type TransitionTargetsHistoryEntry = {
  changedAt: string;
  changedFields: string[];
  before: Partial<TransitionTargets>;
  after: Partial<TransitionTargets>;
};

export type StrengthTestAnswer = {
  questionId: number;
  section: string;
  questionText: string;
  score: number;
};

export type StrengthTestSubmission = {
  id: string;
  contactId: string;
  submittedAt: string;
  overallScore: number;
  sectionScores: Record<string, number>;
  answers: StrengthTestAnswer[];
  status: "pending_pdf" | "complete" | "pdf_failed";
  pdfFilename?: string;
};

type CrmStore = { contacts: Contact[]; contactStamps: ContactStamp[]; deals: Deal[]; dealStamps: DealStamp[]; tasks: Task[]; activities: Activity[]; strengthTests?: StrengthTestSubmission[]; gmail: { connectedAt?: string; lastSyncedAt?: string; messages: GmailMessage[]; tokens?: { access_token?: string; refresh_token?: string; expiry_date?: number; }; }; targets?: TransitionTargets; targetsHistory?: TransitionTargetsHistoryEntry[]; };

const dataRoot = process.env.VERCEL ? "/tmp" : process.cwd();
const dataDir = path.join(dataRoot, "data");
const dbPath = path.join(dataDir, "crm.json");

export const defaultTargets: TransitionTargets = {
  revenueGoalAnnual: 160000,
  avgRevenuePerClientAnnual: 25000,
  targetDate: new Date(new Date().setMonth(new Date().getMonth() + 18)).toISOString().slice(0, 10),
  convWarmToIntro: 50,
  convIntroToDiscovery: 50,
  convDiscoveryToWon: 80,
};

function mapContactStatus(status?: string) {
  if (!status) return "New";
  if (status === "Discovery meeting booked") return "Warm intro booked";
  if (status === "Lost") return "Not right now";
  return status;
}

function mapDealStage(stage?: string) {
  if (!stage) return "Warm intro booked";
  if (stage === "Discovery meeting booked") return "Warm intro booked";
  if (stage === "Discovery meeting completed") return "Warm intro completed";
  if (stage === "Fit meeting booked") return "90-min disco booked";
  if (stage === "Fit meeting completed") return "90-min disco completed";
  if (stage === "Launch paid (won)") return "Launch days paid";
  return stage;
}

const initialStore: CrmStore = { contacts: [], contactStamps: [], deals: [], dealStamps: [], tasks: [], activities: [], strengthTests: [], gmail: { messages: [] }, targets: defaultTargets, targetsHistory: [] };

export const CONTACT_STAGES = ["New", "Attempting", "Connected", "Pipeline Seeding", "Warm intro booked", "Pipeline Seeder", "Not right now"] as const;

export const DEAL_STAGES = ["Warm intro booked", "Warm intro completed", "90-min disco booked", "90-min disco completed", "Proposal / commitment", "Launch days paid", "Lost"] as const;

export const DEAL_STAGE_WEIGHTS: Record<string, number> = {
  "Warm intro booked": 10,
  "Warm intro completed": 15,
  "90-min disco booked": 25,
  "90-min disco completed": 35,
  "Proposal / commitment": 50,
  "Launch days paid": 100,
  "Lost": 0,
};

const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    })
  : null;
let schemaReady = false;

function mapLegacyDealStage(stage: string | undefined) {
  const s = String(stage || "").trim();
  if (s === "90-minute booked") return "Fit meeting booked";
  if (s === "90-minute complete") return "Fit meeting completed";
  if (s === "Verbal Yes") return "Proposal / commitment";
  if (s === "Client signed (won)") return "Launch paid (won)";
  return s || DEAL_STAGES[0];
}

function normalizeStore(store: CrmStore): CrmStore {
  const contacts = (store.contacts || []).map((c) => ({
    ...c,
    status: mapContactStatus(c.status),
    referralCount: Number((c as any).referralCount || 0),
    nextReachOutAt: (c as any).nextReachOutAt || undefined,
    seederNotes: (c as any).seederNotes || undefined,
  }));

  const deals = (store.deals || []).map((d) => {
    const legacyStage = mapLegacyDealStage(d.stage);
    const stage = mapDealStage(legacyStage);
    const clientStage = stage === "Launch days paid" ? (d.clientStage || "Launch") : d.clientStage;
    const launchIncluded: "Yes" | "No" = d.launchIncluded === "No" ? "No" : "Yes";
    const dailyRate = Number(d.dailyRate || 5000);
    const launchFee = launchIncluded === "Yes" ? dailyRate * 3 : 0;
    const annualFee = dailyRate * 5;
    const amount = launchFee + annualFee;
    return { ...d, stage, clientStage, launchIncluded, dailyRate, launchFee, annualFee, value: amount, probability: DEAL_STAGE_WEIGHTS[stage] ?? 0 };
  });
  return {
    ...store,
    contacts,
    deals,
    dealStamps: store.dealStamps || [],
    contactStamps: store.contactStamps || [],
    strengthTests: Array.isArray(store.strengthTests) ? store.strengthTests : [],
    targets: { ...defaultTargets, ...(store.targets || {}) },
    targetsHistory: Array.isArray(store.targetsHistory) ? store.targetsHistory : [],
  };
}

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
    create table if not exists crm_contact_stamps (
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
    create table if not exists crm_deal_stamps (
      id text primary key,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create table if not exists crm_activities (
      id text primary key,
      data jsonb not null,
      occurred_at timestamptz,
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
  const [contactsQ, contactStampsQ, dealsQ, dealStampsQ, tasksQ, activitiesQ, gmailQ, targetsQ, targetsHistoryQ, strengthTestsQ] = await Promise.all([
    pool.query("select data from crm_contacts order by updated_at desc"),
    pool.query("select data from crm_contact_stamps order by updated_at desc"),
    pool.query("select data from crm_deals order by updated_at desc"),
    pool.query("select data from crm_deal_stamps order by updated_at desc"),
    pool.query("select data from crm_tasks order by updated_at desc"),
    pool.query("select data from crm_activities order by occurred_at desc nulls last, updated_at desc"),
    pool.query("select data from crm_meta where key='gmail' limit 1"),
    pool.query("select data from crm_meta where key='targets' limit 1"),
    pool.query("select data from crm_meta where key='targets_history' limit 1"),
    pool.query("select data from crm_meta where key='strength_tests' limit 1"),
  ]);
  const gmailData = gmailQ.rows[0]?.data || { messages: [] };
  const targetsData = targetsQ.rows[0]?.data || defaultTargets;
  const targetsHistoryData = targetsHistoryQ.rows[0]?.data || [];
  const strengthTestsData = strengthTestsQ.rows[0]?.data || [];
  return normalizeStore({
    contacts: contactsQ.rows.map((r: any) => r.data),
    contactStamps: contactStampsQ.rows.map((r: any) => r.data),
    deals: dealsQ.rows.map((r: any) => r.data),
    dealStamps: dealStampsQ.rows.map((r: any) => r.data),
    tasks: tasksQ.rows.map((r: any) => r.data),
    activities: activitiesQ.rows.map((r: any) => r.data),
    strengthTests: Array.isArray(strengthTestsData) ? strengthTestsData : [],
    gmail: { ...gmailData, messages: gmailData.messages || [] },
    targets: { ...defaultTargets, ...targetsData },
    targetsHistory: Array.isArray(targetsHistoryData) ? targetsHistoryData : [],
  });
}

async function saveStorePg(store: CrmStore) {
  if (!pool) throw new Error("No database");
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("truncate crm_contacts, crm_contact_stamps, crm_deals, crm_deal_stamps, crm_tasks, crm_activities");
    for (const c of store.contacts) {
      await client.query("insert into crm_contacts (id, data, updated_at) values ($1,$2,now())", [c.id, c]);
    }
    for (const s of (store.contactStamps || [])) {
      await client.query("insert into crm_contact_stamps (id, data, updated_at) values ($1,$2,now())", [s.id, s]);
    }
    for (const d of store.deals) {
      await client.query("insert into crm_deals (id, data, updated_at) values ($1,$2,now())", [d.id, d]);
    }
    for (const s of (store.dealStamps || [])) {
      await client.query("insert into crm_deal_stamps (id, data, updated_at) values ($1,$2,now())", [s.id, s]);
    }
    for (const t of store.tasks) {
      await client.query("insert into crm_tasks (id, data, updated_at) values ($1,$2,now())", [t.id, t]);
    }
    for (const a of (store.activities || [])) {
      await client.query("insert into crm_activities (id, data, updated_at, occurred_at) values ($1,$2,now(),$3)", [a.id, a, a.occurredAt || null]);
    }
    await client.query(
      "insert into crm_meta (key, data, updated_at) values ('gmail', $1::jsonb, now()) on conflict (key) do update set data=excluded.data, updated_at=now()",
      [JSON.stringify(store.gmail)]
    );
    await client.query(
      "insert into crm_meta (key, data, updated_at) values ('targets', $1::jsonb, now()) on conflict (key) do update set data=excluded.data, updated_at=now()",
      [JSON.stringify(store.targets || defaultTargets)]
    );
    await client.query(
      "insert into crm_meta (key, data, updated_at) values ('targets_history', $1::jsonb, now()) on conflict (key) do update set data=excluded.data, updated_at=now()",
      [JSON.stringify(store.targetsHistory || [])]
    );
    await client.query(
      "insert into crm_meta (key, data, updated_at) values ('strength_tests', $1::jsonb, now()) on conflict (key) do update set data=excluded.data, updated_at=now()",
      [JSON.stringify(store.strengthTests || [])]
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
    return normalizeStore({ ...initialStore, ...parsed, gmail: { ...initialStore.gmail, ...(parsed.gmail || {}), messages: parsed.gmail?.messages || [] } });
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
  if (pool) {
    try {
      return await getStorePg();
    } catch (error) {
      console.error("[crm-store] Postgres read failed", error);
      if (process.env.VERCEL) throw error;
      return getStoreFile();
    }
  }
  return getStoreFile();
}

export async function saveStore(store: CrmStore) {
  if (pool) {
    try {
      return await saveStorePg(store);
    } catch (error) {
      console.error("[crm-store] Postgres write failed", error);
      if (process.env.VERCEL) throw error;
      return saveStoreFile(store);
    }
  }
  return saveStoreFile(store);
}

export const id = () => Math.random().toString(36).slice(2, 10);
export const now = () => new Date().toISOString();
export const storageMode = () => (pool ? "postgres" : "file");
