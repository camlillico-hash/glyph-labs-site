import { cookies } from "next/headers";
import { authSessionFromCookies, activeAccountCookieName, isLocalCrmBypassEnabled } from "@/lib/crm-auth";
import { getUserAccountIds } from "@/lib/crm-auth-store";

export async function requireCrmSession() {
  const session = await authSessionFromCookies();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function resolveActiveAccountId() {
  const session = await requireCrmSession();
  const memberships = await getUserAccountIds(session.uid);
  if (!memberships.length && isLocalCrmBypassEnabled() && session.uid === "local-dev") {
    const { getCrmPool } = await import("@/lib/crm-db");
    const pool = getCrmPool();
    if (!pool) throw new Error("NO_ACCOUNT");

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
    const populatedAccountId = populated.rows[0]?.account_id as string | undefined;
    if (populatedAccountId) return populatedAccountId;

    const firstAccount = await pool.query(
      `select id from crm_accounts order by created_at asc limit 1`
    );
    const firstAccountId = firstAccount.rows[0]?.id as string | undefined;
    if (firstAccountId) return firstAccountId;
  }
  if (!memberships.length) throw new Error("NO_ACCOUNT");
  const allowed = new Set(memberships.map((m) => m.account_id));
  const ordered = memberships.map((m) => m.account_id);

  // Admin can switch accounts via cookie, but only to accounts they belong to.
  const c = await cookies();
  const desired = c.get(activeAccountCookieName)?.value;
  const canUseDesired = session.role === "owner" && desired && allowed.has(desired);
  if (canUseDesired) return String(desired);

  let populated: string | undefined;

  // Otherwise prefer the linked account that actually has CRM rows.
  try {
    const { getCrmPool } = await import("@/lib/crm-db");
    const pool = getCrmPool();
    if (pool) {
      const q = await pool.query(
        `
        with counts as (
          select account_id, count(*)::int as row_count from crm_contacts where account_id = any($1::text[]) group by account_id
          union all
          select account_id, count(*)::int as row_count from crm_deals where account_id = any($1::text[]) group by account_id
          union all
          select account_id, count(*)::int as row_count from crm_tasks where account_id = any($1::text[]) group by account_id
          union all
          select account_id, count(*)::int as row_count from crm_activities where account_id = any($1::text[]) group by account_id
        )
        select account_id, sum(row_count)::int as total_rows
        from counts
        group by account_id
        order by total_rows desc, array_position($1::text[], account_id) asc
        `,
        [ordered]
      );
      populated = q.rows[0]?.account_id as string | undefined;
    }
  } catch (error) {
    console.error("[crm-scope] failed to choose populated account", error);
  }

  if (populated && allowed.has(populated)) return populated;

  // Then prefer an explicitly owner membership if present.
  const ownerMembership = memberships.find((m) => m.role === "owner");
  if (ownerMembership?.account_id) return ownerMembership.account_id;

  return ordered[0];
}
