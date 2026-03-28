import { cookies } from "next/headers";
import { authSessionFromCookies, activeAccountCookieName } from "@/lib/crm-auth";
import { getUserAccountIds } from "@/lib/crm-auth-store";

export async function requireCrmSession() {
  const session = await authSessionFromCookies();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function resolveActiveAccountId() {
  const session = await requireCrmSession();
  const memberships = await getUserAccountIds(session.uid);
  if (!memberships.length) throw new Error("NO_ACCOUNT");
  const allowed = new Set(memberships.map((m) => m.account_id));

  // Admin can switch accounts via cookie, but only to accounts they belong to.
  const c = await cookies();
  const desired = c.get(activeAccountCookieName)?.value;
  if (session.role === "owner" && desired && allowed.has(desired)) return desired;

  // Otherwise: first account linked to user.
  return memberships[0].account_id;
}
