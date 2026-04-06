import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

export const CONTACT_PIPELINES = ["connector", "icp"] as const;
export type ContactPipeline = (typeof CONTACT_PIPELINES)[number];
export const LEAD_SOURCES = ["Connector", "Inbound", "Outbound", "Event", "Referral", "Other"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
export const CONNECTOR_STAGES = ["Identified", "Attempting", "Connected", "Positioned", "Activated", "Intro Pending", "Intro Delivered", "Nurture", "Closed Lost"] as const;
export const ICP_STAGES = ["New", "Attempting", "Connected", "Warm intro booked", "Nurture", "Closed Lost"] as const;
export const CONTACT_STAGES = [...new Set([...CONNECTOR_STAGES, ...ICP_STAGES])] as const;
export const DEAL_STAGES = ["Warm intro booked", "Warm intro completed", "90-min disco booked", "90-min disco completed", "Proposal / commitment", "Launch paid (won)", "Lost"] as const;
export const CLIENT_STAGES = ["Launch", "Active rhythm", "At Risk", "Paused", "Completed / Alumni"] as const;

export const CONTACT_DISQUALIFICATION_REASONS = ["Couldn't connect", "Went cold", "Said no", "Not the right person", "Timing not right", "Relationship not viable right now", "Bad data / test lead", "Other"] as const;
export type ContactDisqualificationReason = (typeof CONTACT_DISQUALIFICATION_REASONS)[number];

export type Contact = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  company?: string;
  industry?: string;
  employeeSize?: string;
  areaGeo?: string;
  linkedinConnectRequest?: string;
  title?: string;
  type?: string;
  pipelineType?: ContactPipeline;
  leadSource?: LeadSource | string;
  connectorContactId?: string;
  connectorName?: string;
  introDate?: string;
  primaryPain?: "Execution" | "Strategy" | "Culture";
  status?: string;
  strengthTest?: "Yes" | null;
  disqualificationReason?: ContactDisqualificationReason;
  whatNow?: "Leave them" | "Nurture (future)";
  referralCount?: number;
  nextReachOutAt?: string;
  seederNotes?: string;
  tags?: string[];
  notes?: string;
  lastActivityDate?: string;
  lastActivityType?: string;
  openBoardHidden?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Deal = {
  id: string;
  name?: string;
  contactId?: string;
  company?: string;
  stage: string;
  clientStage?: (typeof CLIENT_STAGES)[number];
  primaryPain?: "Execution" | "Strategy" | "Culture";
  leadSource?: LeadSource | string;
  connectorContactId?: string;
  connectorName?: string;
  introDate?: string;
  launchIncluded?: "Yes" | "No";
  dailyRate?: number;
  launchFee?: number;
  annualFee?: number;
  value?: number;
  launchDay1Date?: string;
  launchDay2Date?: string;
  launchDay3Date?: string;
  nextQuarterlyDate?: string;
  nextAnnualDay1Date?: string;
  nextAnnualDay2Date?: string;
  probability?: number;
  expectedCloseDate?: string;
  nextStep?: string;
  lastActivityAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Task = { id: string; title: string; type?: "email" | "call" | "text" | "linkedin" | "in_person" | "meeting" | "to_do" | "task_completed"; relatedType?: "contact" | "deal"; relatedId?: string; dueDate?: string; status?: "Overdue" | "Not started" | "Completed" | "Canceled"; followUpForContactId?: string; followUpKind?: "nurture_reactivate"; done: boolean; notes?: string; createdAt: string; updatedAt: string; };
export type GmailMessage = { id: string; threadId?: string; from?: string; to?: string; subject?: string; date?: string; snippet?: string; };
export type Activity = { id: string; contactId: string; type: "email" | "call" | "text" | "linkedin" | "in_person" | "meeting" | "task_completed"; note?: string; occurredAt: string; createdAt: string; updatedAt: string; };

export type DealStamp = { id: string; dealId: string; name?: string; company?: string; contactId?: string; value?: number; wonAt: string; removedAt?: string };
export type ContactStamp = { id: string; contactId: string; name?: string; company?: string; email?: string; wonAt: string; removedAt?: string };

export type TransitionTargets = {
  revenueGoalAnnual: number;
  avgRevenuePerClientAnnual: number;
  targetDate: string;
  convConnectorActivatedToIntroDelivered: number;
  convLeadToWarmIntro: number;
  convWarmIntroToDiscovery: number;
  convDiscoveryToLaunch: number;
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
  convConnectorActivatedToIntroDelivered: 40,
  convLeadToWarmIntro: 50,
  convWarmIntroToDiscovery: 50,
  convDiscoveryToLaunch: 50,
};

export function normalizeTransitionTargets(raw?: Partial<TransitionTargets> & Record<string, any>): TransitionTargets {
  const source = raw || {};
  return {
    revenueGoalAnnual: Number(source.revenueGoalAnnual ?? defaultTargets.revenueGoalAnnual) || defaultTargets.revenueGoalAnnual,
    avgRevenuePerClientAnnual: Number(source.avgRevenuePerClientAnnual ?? defaultTargets.avgRevenuePerClientAnnual) || defaultTargets.avgRevenuePerClientAnnual,
    targetDate: typeof source.targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source.targetDate) ? source.targetDate : defaultTargets.targetDate,
    convConnectorActivatedToIntroDelivered: Math.max(0, Math.min(100, Number(source.convConnectorActivatedToIntroDelivered ?? source.convActivatedToIntroDelivered ?? defaultTargets.convConnectorActivatedToIntroDelivered) || 0)),
    convLeadToWarmIntro: Math.max(0, Math.min(100, Number(source.convLeadToWarmIntro ?? source.convIntroDeliveredToWarmIntroBooked ?? defaultTargets.convLeadToWarmIntro) || 0)),
    convWarmIntroToDiscovery: Math.max(0, Math.min(100, Number(source.convWarmIntroToDiscovery ?? source.convWarmIntroBookedToWon ?? defaultTargets.convWarmIntroToDiscovery) || 0)),
    convDiscoveryToLaunch: Math.max(0, Math.min(100, Number(source.convDiscoveryToLaunch ?? defaultTargets.convDiscoveryToLaunch) || 0)),
  };
}

function normalizeLeadSource(value?: string) {
  const v = String(value || "").trim();
  if (!v) return undefined;
  const canonical = LEAD_SOURCES.find((item) => item.toLowerCase() === v.toLowerCase());
  return canonical || v;
}

function mapDisqualificationReason(value?: string): ContactDisqualificationReason | undefined {
  const v = String(value || "").trim().replace(/[’`]/g, "'");
  if (!v) return undefined;
  const legacyMap: Record<string, ContactDisqualificationReason> = {
    "Shouldn't reach out just yet": "Timing not right",
    "Done tapping network for now.": "Relationship not viable right now",
    "Test Lead or Bad Data": "Bad data / test lead",
  };
  const normalized = legacyMap[v] || v;
  return (CONTACT_DISQUALIFICATION_REASONS as readonly string[]).includes(normalized)
    ? (normalized as ContactDisqualificationReason)
    : undefined;
}

function inferPipelineType(contact: Partial<Contact>) {
  const existing = String(contact.pipelineType || "").trim().toLowerCase();
  if (existing === "connector" || existing === "icp") return existing as ContactPipeline;
  const status = String(contact.status || "").trim();
  if (["Identified", "Positioned", "Activated", "Intro Pending", "Intro Delivered"].includes(status)) return "connector";
  if (["Pipeline Seeding", "Pipeline Seeder"].includes(status)) return "connector";
  if (["Warm intro booked", "Closed Lost"].includes(status)) return "connector";
  const source = String(contact.leadSource || "").trim().toLowerCase();
  if (source === "connector") return "connector";
  const referralCount = Number((contact as any).referralCount || 0);
  if (referralCount > 0) return "connector";
  return "connector";
}

function mapContactStatus(status?: string, pipelineType?: ContactPipeline) {
  if (!status) return pipelineType === "connector" ? "Identified" : "New";
  const normalized = String(status).trim();
  if (normalized === "Discovery meeting booked") return "Warm intro booked";
  if (normalized === "Lost") return pipelineType === "connector" ? "Nurture" : "Closed Lost";

  if (pipelineType === "connector") {
    const connectorMap: Record<string, string> = {
      "New": "Identified",
      "Attempting": "Attempting",
      "Connected": "Connected",
      "Pipeline Seeding": "Positioned",
      "Warm intro booked": "Intro Delivered",
      "Pipeline Seeder": "Nurture",
      "Not right now": "Nurture",
    };
    return (connectorMap[normalized] || ((CONNECTOR_STAGES as readonly string[]).includes(normalized) ? normalized : "Identified"));
  }

  const icpMap: Record<string, string> = {
    "New": "New",
    "Attempting": "Attempting",
    "Connected": "Connected",
    "Pipeline Seeding": "Connected",
    "Warm intro booked": "Warm intro booked",
    "Pipeline Seeder": "Nurture",
    "Not right now": "Nurture",
  };
  const mapped = icpMap[normalized] || normalized;
  return (ICP_STAGES as readonly string[]).includes(mapped) ? mapped : "New";
}

function mapDealStage(stage?: string) {
  if (!stage) return "Warm intro booked";
  if (stage === "Discovery meeting booked") return "Warm intro booked";
  if (stage === "Discovery meeting completed") return "Warm intro completed";
  if (stage === "Fit meeting booked") return "90-min disco booked";
  if (stage === "Fit meeting completed") return "90-min disco completed";
  if (stage === "Launch days paid") return "Launch paid (won)";
  return stage;
}

function pruneOrphanRelations(store: CrmStore): CrmStore {
  const contactIds = new Set((store.contacts || []).map((c) => c.id));
  const dealIds = new Set((store.deals || []).map((d) => d.id));

  const tasks = (store.tasks || []).filter((t) => {
    if (t.relatedType === "deal") return Boolean(t.relatedId) && dealIds.has(String(t.relatedId));
    return Boolean(t.relatedId) && contactIds.has(String(t.relatedId)) && (!t.followUpForContactId || contactIds.has(String(t.followUpForContactId)));
  });

  const activities = (store.activities || []).filter((a) => Boolean(a.contactId) && contactIds.has(String(a.contactId)));

  return {
    ...store,
    tasks,
    activities,
  };
}

const initialStore: CrmStore = { contacts: [], contactStamps: [], deals: [], dealStamps: [], tasks: [], activities: [], strengthTests: [], gmail: { messages: [] }, targets: defaultTargets, targetsHistory: [] };

export const DEAL_STAGE_WEIGHTS: Record<string, number> = {
  "Warm intro booked": 10,
  "Warm intro completed": 15,
  "90-min disco booked": 25,
  "90-min disco completed": 35,
  "Proposal / commitment": 50,
  "Launch paid (won)": 100,
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
  const strengthTests = Array.isArray(store.strengthTests) ? store.strengthTests : [];
  const testedContactIds = new Set(strengthTests.map((s) => s.contactId));

  const contacts = (store.contacts || []).map((c) => {
    const pipelineType = inferPipelineType(c);
    return {
      ...c,
      pipelineType,
      leadSource: normalizeLeadSource(c.leadSource),
      status: mapContactStatus(c.status, pipelineType),
      disqualificationReason: mapDisqualificationReason(c.disqualificationReason),
      connectorName: c.connectorName || undefined,
      connectorContactId: c.connectorContactId || undefined,
      introDate: c.introDate || undefined,
      strengthTest: testedContactIds.has(c.id) ? "Yes" : ((c as any).strengthTest || null),
      referralCount: Number((c as any).referralCount || 0),
      nextReachOutAt: (c as any).nextReachOutAt || undefined,
      seederNotes: (c as any).seederNotes || undefined,
      openBoardHidden: Boolean((c as any).openBoardHidden),
    };
  });

  const deals = (store.deals || []).map((d) => {
    const legacyStage = mapLegacyDealStage(d.stage);
    const stage = mapDealStage(legacyStage);
    const clientStage = stage === "Launch paid (won)" ? (d.clientStage || "Launch") : d.clientStage;
    const launchIncluded: "Yes" | "No" = d.launchIncluded === "No" ? "No" : "Yes";
    const dailyRate = Number(d.dailyRate || 5000);
    const launchFee = launchIncluded === "Yes" ? dailyRate * 3 : 0;
    const annualFee = dailyRate * 5;
    const amount = launchFee + annualFee;
    return { ...d, stage, clientStage, leadSource: normalizeLeadSource(d.leadSource), connectorContactId: d.connectorContactId || undefined, connectorName: d.connectorName || undefined, introDate: d.introDate || undefined, launchIncluded, dailyRate, launchFee, annualFee, value: amount, probability: DEAL_STAGE_WEIGHTS[stage] ?? 0 };
  });

  const targetsRaw: any = { ...defaultTargets, ...(store.targets || {}) };
  const targets = normalizeTransitionTargets(targetsRaw);

  return pruneOrphanRelations({
    ...store,
    contacts,
    deals,
    dealStamps: store.dealStamps || [],
    contactStamps: store.contactStamps || [],
    strengthTests,
    targets,
    targetsHistory: Array.isArray(store.targetsHistory) ? store.targetsHistory : [],
  });
}

async function ensureSchema() {
  if (!pool || schemaReady) return;
  await pool.query(`
    create table if not exists crm_contacts (
      id text primary key,
      account_id text,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index if not exists crm_contacts_account_id_idx on crm_contacts(account_id);

    create table if not exists crm_deals (
      id text primary key,
      account_id text,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index if not exists crm_deals_account_id_idx on crm_deals(account_id);

    create table if not exists crm_contact_stamps (
      id text primary key,
      account_id text,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index if not exists crm_contact_stamps_account_id_idx on crm_contact_stamps(account_id);

    create table if not exists crm_tasks (
      id text primary key,
      account_id text,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index if not exists crm_tasks_account_id_idx on crm_tasks(account_id);

    create table if not exists crm_deal_stamps (
      id text primary key,
      account_id text,
      data jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index if not exists crm_deal_stamps_account_id_idx on crm_deal_stamps(account_id);

    create table if not exists crm_activities (
      id text primary key,
      account_id text,
      data jsonb not null,
      occurred_at timestamptz,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index if not exists crm_activities_account_id_idx on crm_activities(account_id);

    create table if not exists crm_meta (
      key text,
      account_id text,
      data jsonb not null,
      updated_at timestamptz default now(),
      primary key (key, account_id)
    );
    create index if not exists crm_meta_account_id_idx on crm_meta(account_id);
  `);
  schemaReady = true;
}

async function getStorePg(accountId?: string): Promise<CrmStore> {
  if (!pool) throw new Error("No database");
  await ensureSchema();
  const scoped = Boolean(accountId);
  const [contactsQ, contactStampsQ, dealsQ, dealStampsQ, tasksQ, activitiesQ, gmailQ, targetsQ, targetsHistoryQ, strengthTestsQ] = await Promise.all([
    scoped
      ? pool.query("select data from crm_contacts where account_id=$1 order by updated_at desc", [accountId])
      : pool.query("select data from crm_contacts order by updated_at desc"),
    scoped
      ? pool.query("select data from crm_contact_stamps where account_id=$1 order by updated_at desc", [accountId])
      : pool.query("select data from crm_contact_stamps order by updated_at desc"),
    scoped
      ? pool.query("select data from crm_deals where account_id=$1 order by updated_at desc", [accountId])
      : pool.query("select data from crm_deals order by updated_at desc"),
    scoped
      ? pool.query("select data from crm_deal_stamps where account_id=$1 order by updated_at desc", [accountId])
      : pool.query("select data from crm_deal_stamps order by updated_at desc"),
    scoped
      ? pool.query("select data from crm_tasks where account_id=$1 order by updated_at desc", [accountId])
      : pool.query("select data from crm_tasks order by updated_at desc"),
    scoped
      ? pool.query("select data from crm_activities where account_id=$1 order by occurred_at desc nulls last, updated_at desc", [accountId])
      : pool.query("select data from crm_activities order by occurred_at desc nulls last, updated_at desc"),
    scoped
      ? pool.query("select data from crm_meta where key='gmail' and account_id=$1 limit 1", [accountId])
      : pool.query("select data from crm_meta where key='gmail' and account_id is null limit 1"),
    scoped
      ? pool.query("select data from crm_meta where key='targets' and account_id=$1 limit 1", [accountId])
      : pool.query("select data from crm_meta where key='targets' and account_id is null limit 1"),
    scoped
      ? pool.query("select data from crm_meta where key='targets_history' and account_id=$1 limit 1", [accountId])
      : pool.query("select data from crm_meta where key='targets_history' and account_id is null limit 1"),
    scoped
      ? pool.query("select data from crm_meta where key='strength_tests' and account_id=$1 limit 1", [accountId])
      : pool.query("select data from crm_meta where key='strength_tests' and account_id is null limit 1"),
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

async function saveStorePg(store: CrmStore, accountId?: string) {
  if (!pool) throw new Error("No database");
  if (!accountId) throw new Error("Missing accountId");
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("begin");

    await client.query("delete from crm_contacts where account_id=$1", [accountId]);
    await client.query("delete from crm_contact_stamps where account_id=$1", [accountId]);
    await client.query("delete from crm_deals where account_id=$1", [accountId]);
    await client.query("delete from crm_deal_stamps where account_id=$1", [accountId]);
    await client.query("delete from crm_tasks where account_id=$1", [accountId]);
    await client.query("delete from crm_activities where account_id=$1", [accountId]);
    await client.query("delete from crm_meta where account_id=$1", [accountId]);

    for (const c of store.contacts) {
      await client.query("insert into crm_contacts (id, account_id, data, updated_at) values ($1,$2,$3,now())", [c.id, accountId, c]);
    }
    for (const s of (store.contactStamps || [])) {
      await client.query("insert into crm_contact_stamps (id, account_id, data, updated_at) values ($1,$2,$3,now())", [s.id, accountId, s]);
    }
    for (const d of store.deals) {
      await client.query("insert into crm_deals (id, account_id, data, updated_at) values ($1,$2,$3,now())", [d.id, accountId, d]);
    }
    for (const s of (store.dealStamps || [])) {
      await client.query("insert into crm_deal_stamps (id, account_id, data, updated_at) values ($1,$2,$3,now())", [s.id, accountId, s]);
    }
    for (const t of store.tasks) {
      await client.query("insert into crm_tasks (id, account_id, data, updated_at) values ($1,$2,$3,now())", [t.id, accountId, t]);
    }
    for (const a of (store.activities || [])) {
      await client.query("insert into crm_activities (id, account_id, data, updated_at, occurred_at) values ($1,$2,$3,now(),$4)", [a.id, accountId, a, a.occurredAt || null]);
    }
    await client.query(
      "insert into crm_meta (key, account_id, data, updated_at) values ('gmail',$1,$2::jsonb,now())",
      [accountId, JSON.stringify(store.gmail)]
    );
    await client.query(
      "insert into crm_meta (key, account_id, data, updated_at) values ('targets',$1,$2::jsonb,now())",
      [accountId, JSON.stringify(store.targets || defaultTargets)]
    );
    await client.query(
      "insert into crm_meta (key, account_id, data, updated_at) values ('targets_history',$1,$2::jsonb,now())",
      [accountId, JSON.stringify(store.targetsHistory || [])]
    );
    await client.query(
      "insert into crm_meta (key, account_id, data, updated_at) values ('strength_tests',$1,$2::jsonb,now())",
      [accountId, JSON.stringify(store.strengthTests || [])]
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

export async function getStore(accountId?: string): Promise<CrmStore> {
  if (pool) {
    try {
      return await getStorePg(accountId);
    } catch (error) {
      console.error("[crm-store] Postgres read failed", error);
      if (process.env.VERCEL) throw error;
      return getStoreFile();
    }
  }
  return getStoreFile();
}

export async function saveStore(store: CrmStore, accountId?: string) {
  if (pool) {
    try {
      return await saveStorePg(store, accountId);
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
