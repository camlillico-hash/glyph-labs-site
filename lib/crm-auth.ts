import { cookies } from "next/headers";

const COOKIE_NAME = "crm_session";
const ROLE_COOKIE = "crm_role";

function baseSecret() {
  return process.env.CRM_SESSION_SECRET || "local-dev-secret";
}

export function ownerPassword() {
  return process.env.CRM_PASSWORD || "changeme";
}

export function guestPassword() {
  return process.env.CRM_GUEST_PASSWORD || "";
}

export function sessionToken(role: "owner" | "guest") {
  return `${baseSecret()}:${role}`;
}

export async function authRoleFromCookies() {
  const c = await cookies();
  const v = c.get(COOKIE_NAME)?.value;
  if (v === sessionToken("owner")) return "owner" as const;
  if (v === sessionToken("guest")) return "guest" as const;
  return null;
}

export const sessionCookieName = COOKIE_NAME;
export const roleCookieName = ROLE_COOKIE;
