import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getCrmPool } from "@/lib/crm-db";

export type CodexRole = "system" | "user" | "assistant";

export type CodexThread = {
  id: string;
  userId: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
};

export type CodexMessage = {
  id: string;
  threadId: string;
  userId: string;
  role: CodexRole;
  content: string;
  createdAt: string;
  meta?: Record<string, unknown>;
};

type CodexFileStore = {
  threads: CodexThread[];
  messages: CodexMessage[];
};

const dataRoot = process.env.VERCEL ? "/tmp" : process.cwd();
const dataDir = path.join(dataRoot, "data");
const dbPath = path.join(dataDir, "codex.json");
const initialStore: CodexFileStore = { threads: [], messages: [] };

let schemaReady = false;

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return crypto.randomUUID();
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asOptionalRecord(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : undefined;
}

function toIso(v: unknown) {
  const date = new Date(String(v || ""));
  if (Number.isNaN(date.valueOf())) return nowIso();
  return date.toISOString();
}

async function ensurePgSchema() {
  const pool = getCrmPool();
  if (!pool || schemaReady) return;

  await pool.query(`
    create table if not exists codex_threads (
      id text primary key,
      user_id text not null,
      title text not null,
      model text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      last_message_at timestamptz not null default now(),
      message_count integer not null default 0
    );
    create index if not exists codex_threads_user_updated_idx on codex_threads(user_id, updated_at desc);

    create table if not exists codex_messages (
      id text primary key,
      thread_id text not null references codex_threads(id) on delete cascade,
      user_id text not null,
      role text not null check (role in ('system', 'user', 'assistant')),
      content text not null,
      meta jsonb,
      created_at timestamptz not null default now()
    );
    create index if not exists codex_messages_thread_created_idx on codex_messages(thread_id, created_at asc);
    create index if not exists codex_messages_user_created_idx on codex_messages(user_id, created_at desc);
  `);

  schemaReady = true;
}

function mapThreadRow(row: unknown): CodexThread {
  const data = asRecord(row);
  return {
    id: String(data.id),
    userId: String(data.user_id),
    title: String(data.title || "New chat"),
    model: String(data.model || "gpt-5.4"),
    createdAt: toIso(data.created_at),
    updatedAt: toIso(data.updated_at),
    lastMessageAt: toIso(data.last_message_at),
    messageCount: Number(data.message_count || 0),
  };
}

function mapMessageRow(row: unknown): CodexMessage {
  const data = asRecord(row);
  const maybeRole = String(data.role || "");
  const role: CodexRole =
    maybeRole === "system" || maybeRole === "assistant" || maybeRole === "user"
      ? maybeRole
      : "assistant";
  return {
    id: String(data.id),
    threadId: String(data.thread_id),
    userId: String(data.user_id),
    role,
    content: String(data.content || ""),
    createdAt: toIso(data.created_at),
    meta: asOptionalRecord(data.meta),
  };
}

async function readFileStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    const parsed = JSON.parse(await readFile(dbPath, "utf8")) as CodexFileStore;
    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    } satisfies CodexFileStore;
  } catch {
    await writeFile(dbPath, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
}

async function writeFileStore(store: CodexFileStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(store, null, 2));
}

async function listThreadsFile(userId: string, limit = 50) {
  const store = await readFileStore();
  return store.threads
    .filter((t) => t.userId === userId)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, limit);
}

async function getThreadFile(userId: string, threadId: string) {
  const store = await readFileStore();
  return store.threads.find((t) => t.userId === userId && t.id === threadId) || null;
}

async function createThreadFile(userId: string, title: string, model: string) {
  const store = await readFileStore();
  const now = nowIso();
  const thread: CodexThread = {
    id: makeId(),
    userId,
    title,
    model,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    messageCount: 0,
  };
  store.threads.unshift(thread);
  await writeFileStore(store);
  return thread;
}

async function updateThreadTitleFile(userId: string, threadId: string, title: string) {
  const store = await readFileStore();
  const idx = store.threads.findIndex((t) => t.userId === userId && t.id === threadId);
  if (idx < 0) return null;
  const next = {
    ...store.threads[idx],
    title,
    updatedAt: nowIso(),
  };
  store.threads[idx] = next;
  await writeFileStore(store);
  return next;
}

async function updateThreadModelFile(userId: string, threadId: string, model: string) {
  const store = await readFileStore();
  const idx = store.threads.findIndex((t) => t.userId === userId && t.id === threadId);
  if (idx < 0) return null;
  const next = {
    ...store.threads[idx],
    model,
    updatedAt: nowIso(),
  };
  store.threads[idx] = next;
  await writeFileStore(store);
  return next;
}

async function listMessagesFile(userId: string, threadId: string, limit = 300) {
  const store = await readFileStore();
  return store.messages
    .filter((m) => m.userId === userId && m.threadId === threadId)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .slice(Math.max(0, store.messages.length - limit));
}

async function appendMessageFile(input: Omit<CodexMessage, "id" | "createdAt">) {
  const store = await readFileStore();
  const createdAt = nowIso();
  const message: CodexMessage = {
    id: makeId(),
    threadId: input.threadId,
    userId: input.userId,
    role: input.role,
    content: input.content,
    meta: input.meta,
    createdAt,
  };
  store.messages.push(message);
  const idx = store.threads.findIndex((t) => t.id === input.threadId && t.userId === input.userId);
  if (idx >= 0) {
    const next = {
      ...store.threads[idx],
      updatedAt: createdAt,
      lastMessageAt: createdAt,
      messageCount: Number(store.threads[idx].messageCount || 0) + 1,
    };
    store.threads[idx] = next;
  }
  await writeFileStore(store);
  return message;
}

export async function listCodexThreads(userId: string, limit = 50): Promise<CodexThread[]> {
  const pool = getCrmPool();
  if (!pool) return listThreadsFile(userId, limit);
  await ensurePgSchema();
  const result = await pool.query(
    `select id, user_id, title, model, created_at, updated_at, last_message_at, message_count
     from codex_threads
     where user_id = $1
     order by updated_at desc
     limit $2`,
    [userId, limit]
  );
  return result.rows.map(mapThreadRow);
}

export async function getCodexThread(userId: string, threadId: string): Promise<CodexThread | null> {
  const pool = getCrmPool();
  if (!pool) return getThreadFile(userId, threadId);
  await ensurePgSchema();
  const result = await pool.query(
    `select id, user_id, title, model, created_at, updated_at, last_message_at, message_count
     from codex_threads
     where id = $1 and user_id = $2
     limit 1`,
    [threadId, userId]
  );
  if (!result.rowCount) return null;
  return mapThreadRow(result.rows[0]);
}

export async function createCodexThread(input: {
  userId: string;
  title?: string;
  model?: string;
}): Promise<CodexThread> {
  const userId = String(input.userId);
  const title = String(input.title || "New chat").trim() || "New chat";
  const model = String(input.model || "gpt-5.4").trim() || "gpt-5.4";

  const pool = getCrmPool();
  if (!pool) return createThreadFile(userId, title, model);
  await ensurePgSchema();
  const id = makeId();
  const result = await pool.query(
    `insert into codex_threads (id, user_id, title, model, created_at, updated_at, last_message_at, message_count)
     values ($1, $2, $3, $4, now(), now(), now(), 0)
     returning id, user_id, title, model, created_at, updated_at, last_message_at, message_count`,
    [id, userId, title, model]
  );
  return mapThreadRow(result.rows[0]);
}

export async function updateCodexThreadTitle(userId: string, threadId: string, title: string) {
  const nextTitle = String(title || "").trim();
  if (!nextTitle) return null;

  const pool = getCrmPool();
  if (!pool) return updateThreadTitleFile(userId, threadId, nextTitle);
  await ensurePgSchema();
  const result = await pool.query(
    `update codex_threads
     set title = $3, updated_at = now()
     where id = $1 and user_id = $2
     returning id, user_id, title, model, created_at, updated_at, last_message_at, message_count`,
    [threadId, userId, nextTitle]
  );
  if (!result.rowCount) return null;
  return mapThreadRow(result.rows[0]);
}

export async function updateCodexThreadModel(userId: string, threadId: string, model: string) {
  const nextModel = String(model || "").trim();
  if (!nextModel) return null;

  const pool = getCrmPool();
  if (!pool) return updateThreadModelFile(userId, threadId, nextModel);
  await ensurePgSchema();
  const result = await pool.query(
    `update codex_threads
     set model = $3, updated_at = now()
     where id = $1 and user_id = $2
     returning id, user_id, title, model, created_at, updated_at, last_message_at, message_count`,
    [threadId, userId, nextModel]
  );
  if (!result.rowCount) return null;
  return mapThreadRow(result.rows[0]);
}

export async function listCodexMessages(userId: string, threadId: string, limit = 300): Promise<CodexMessage[]> {
  const pool = getCrmPool();
  if (!pool) return listMessagesFile(userId, threadId, limit);
  await ensurePgSchema();
  const result = await pool.query(
    `select id, thread_id, user_id, role, content, meta, created_at
     from codex_messages
     where user_id = $1 and thread_id = $2
     order by created_at asc
     limit $3`,
    [userId, threadId, limit]
  );
  return result.rows.map(mapMessageRow);
}

export async function appendCodexMessage(input: {
  userId: string;
  threadId: string;
  role: CodexRole;
  content: string;
  meta?: Record<string, unknown>;
}): Promise<CodexMessage> {
  const userId = String(input.userId);
  const threadId = String(input.threadId);
  const role = input.role;
  const content = String(input.content || "");
  const meta = input.meta ?? null;

  const pool = getCrmPool();
  if (!pool) {
    return appendMessageFile({
      userId,
      threadId,
      role,
      content,
      meta: (meta || undefined) as Record<string, unknown> | undefined,
    });
  }
  await ensurePgSchema();

  const client = await pool.connect();
  try {
    await client.query("begin");

    const thread = await client.query(
      `select id, user_id from codex_threads where id = $1 and user_id = $2 limit 1`,
      [threadId, userId]
    );
    if (!thread.rowCount) {
      throw new Error("THREAD_NOT_FOUND");
    }

    const id = makeId();
    const inserted = await client.query(
      `insert into codex_messages (id, thread_id, user_id, role, content, meta, created_at)
       values ($1, $2, $3, $4, $5, $6::jsonb, now())
       returning id, thread_id, user_id, role, content, meta, created_at`,
      [id, threadId, userId, role, content, JSON.stringify(meta)]
    );

    await client.query(
      `update codex_threads
       set updated_at = now(), last_message_at = now(), message_count = message_count + 1
       where id = $1 and user_id = $2`,
      [threadId, userId]
    );

    await client.query("commit");
    return mapMessageRow(inserted.rows[0]);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export function deriveThreadTitleFromMessage(message: string) {
  const clean = String(message || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "New chat";
  if (clean.length <= 56) return clean;
  return `${clean.slice(0, 56).trim()}...`;
}
