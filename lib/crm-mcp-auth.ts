import crypto from "node:crypto";
import { getCrmPool } from "@/lib/crm-db";

function firstNonEmpty(values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getCrmMcpApiKey() {
  return firstNonEmpty([
    process.env.CRM_MCP_API_KEY,
    process.env.NOTION_CRM_MCP_API_KEY,
  ]);
}

export function isCrmMcpConfigured() {
  return Boolean(getCrmMcpApiKey());
}

function timingSafeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  try {
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function extractProvidedApiKey(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return firstNonEmpty([
    req.headers.get("x-api-key") || undefined,
    req.headers.get("x-crm-mcp-key") || undefined,
  ]);
}

export function isAuthorizedCrmMcpRequest(req: Request) {
  const expected = getCrmMcpApiKey();
  const provided = extractProvidedApiKey(req);
  if (!expected || !provided) return false;
  return timingSafeEqualString(expected, provided);
}

export function isAllowedCrmMcpOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const requestUrl = new URL(req.url);
  const allowed = new Set<string>([
    requestUrl.origin,
    ...splitCsv(process.env.CRM_MCP_ALLOWED_ORIGINS || ""),
  ]);
  return allowed.has(origin);
}

export function isCrmMcpAccountOverrideEnabled() {
  return process.env.CRM_MCP_ALLOW_ACCOUNT_OVERRIDE === "1";
}

export function getConfiguredCrmMcpAccountId() {
  return firstNonEmpty([
    process.env.CRM_MCP_ACCOUNT_ID,
    process.env.CRM_DEFAULT_ACCOUNT_ID,
  ]);
}

async function findPopulatedAccountId() {
  const pool = getCrmPool();
  if (!pool) return "";
  const populated = await pool.query(
    `
    with counts as (
      select account_id, count(*)::int as row_count from crm_contacts group by account_id
      union all
      select account_id, count(*)::int as row_count from crm_deals group by account_id
      union all
      select account_id, count(*)::int as row_count from crm_tasks group by account_id
      union all
      select account_id, count(*)::int as row_count from crm_activities group by account_id
    )
    select account_id, sum(row_count)::int as total_rows
    from counts
    group by account_id
    order by total_rows desc
    limit 1
    `
  );
  return String(populated.rows[0]?.account_id || "").trim();
}

async function countRowsForAccountId(accountId: string) {
  const normalized = String(accountId || "").trim();
  const pool = getCrmPool();
  if (!pool || !normalized) return 0;
  try {
    const result = await pool.query(
      `
      with counts as (
        select count(*)::int as row_count from crm_contacts where account_id = $1
        union all
        select count(*)::int as row_count from crm_deals where account_id = $1
        union all
        select count(*)::int as row_count from crm_tasks where account_id = $1
        union all
        select count(*)::int as row_count from crm_activities where account_id = $1
      )
      select coalesce(sum(row_count), 0)::int as total_rows
      from counts
      `,
      [normalized]
    );
    return Number(result.rows[0]?.total_rows || 0);
  } catch {
    return 0;
  }
}

async function findFirstAccountId() {
  const pool = getCrmPool();
  if (!pool) return "";
  const firstAccount = await pool.query(
    `select id from crm_accounts order by created_at asc limit 1`
  );
  return String(firstAccount.rows[0]?.id || "").trim();
}

export async function resolveCrmMcpAccountId(preferred?: string) {
  const requested = String(preferred || "").trim();
  if (requested && isCrmMcpAccountOverrideEnabled()) return requested;

  const configured = getConfiguredCrmMcpAccountId();
  if (configured) {
    const configuredRows = await countRowsForAccountId(configured);
    if (configuredRows > 0) return configured;
  }
  if (requested) return requested;

  const populated = await findPopulatedAccountId();
  if (populated) return populated;

  return findFirstAccountId();
}
