import { cookies } from "next/headers";
const COOKIE_NAME = "crm_session";

function token() {
  return process.env.CRM_SESSION_SECRET || "local-dev-secret";
}

export async function isAuthed() {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value === token();
}

export function expectedPassword() {
  return process.env.CRM_PASSWORD || "changeme";
}

export function sessionCookieValue() {
  return token();
}

export const sessionCookieName = COOKIE_NAME;
