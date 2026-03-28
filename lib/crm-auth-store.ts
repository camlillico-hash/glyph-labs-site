import { getCrmPool } from "@/lib/crm-db";

let schemaReady = false;

export async function ensureCrmAuthSchema() {
  const pool = getCrmPool();
  if (!pool || schemaReady) return;
  await pool.query(`
    create table if not exists crm_users (
      id text primary key,
      email text not null unique,
      password_hash text not null,
      is_admin boolean not null default false,
      created_at timestamptz not null default now()
    );

    create table if not exists crm_accounts (
      id text primary key,
      name text not null,
      created_at timestamptz not null default now()
    );

    create table if not exists crm_account_users (
      account_id text not null references crm_accounts(id) on delete cascade,
      user_id text not null references crm_users(id) on delete cascade,
      role text not null check (role in ('owner','admin','member')),
      created_at timestamptz not null default now(),
      primary key (account_id, user_id)
    );
    create index if not exists crm_account_users_user_id_idx on crm_account_users(user_id);
  `);
  schemaReady = true;
}

export type CrmUserRow = {
  id: string;
  email: string;
  password_hash: string;
  is_admin: boolean;
};

export async function getUserByEmail(email: string) {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  const q = await pool.query("select id, email, password_hash, is_admin from crm_users where lower(email)=lower($1) limit 1", [email]);
  return (q.rows[0] as CrmUserRow) || null;
}

export async function getUserById(userId: string) {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  const q = await pool.query("select id, email, password_hash, is_admin from crm_users where id=$1 limit 1", [userId]);
  return (q.rows[0] as CrmUserRow) || null;
}

export async function createAccount({ id, name }: { id: string; name: string }) {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  await pool.query("insert into crm_accounts (id, name) values ($1,$2)", [id, name]);
}

export async function createUser({ id, email, passwordHash, isAdmin }: { id: string; email: string; passwordHash: string; isAdmin: boolean }) {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  await pool.query("insert into crm_users (id, email, password_hash, is_admin) values ($1,$2,$3,$4)", [id, email, passwordHash, isAdmin]);
}

export async function addUserToAccount({ accountId, userId, role }: { accountId: string; userId: string; role: "owner" | "admin" | "member" }) {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  await pool.query("insert into crm_account_users (account_id, user_id, role) values ($1,$2,$3) on conflict (account_id,user_id) do update set role=excluded.role", [
    accountId,
    userId,
    role,
  ]);
}

export async function updateUserPassword({ userId, passwordHash }: { userId: string; passwordHash: string }) {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  await pool.query("update crm_users set password_hash=$2 where id=$1", [userId, passwordHash]);
}

export async function listAccounts() {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  const q = await pool.query("select id, name, created_at from crm_accounts order by created_at desc");
  return q.rows as any[];
}

export async function getUserAccountIds(userId: string) {
  const pool = getCrmPool();
  if (!pool) throw new Error("No database");
  await ensureCrmAuthSchema();
  const q = await pool.query("select account_id, role from crm_account_users where user_id=$1", [userId]);
  return q.rows as { account_id: string; role: string }[];
}
