import { cookies } from "next/headers";
import { activeAccountCookieName, authSessionFromCookies } from "@/lib/crm-auth";
import { getUserAccountIds } from "@/lib/crm-auth-store";

export async function resolveAccountIdForRequest() {
  const session = await authSessionFromCookies();
  if (!session?.uid) return null;

  const memberships = await getUserAccountIds(session.uid).catch(() => []);
  const allowed = new Set(memberships.map((m) => m.account_id));

  const c = await cookies();
  const active = c.get(activeAccountCookieName)?.value;

  if (session.role === "owner" && active && allowed.has(active)) {
    return active;
  }

  // default to first membership (newest/oldest ordering is handled by DB query)
  const first = memberships[0]?.account_id;
  return first || null;
}
