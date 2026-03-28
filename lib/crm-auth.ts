import { cookies } from "next/headers";
import crypto from "node:crypto";

export const sessionCookieName = "crm_session";
export const roleCookieName = "crm_role"; // kept for UI; derived from session
export const activeAccountCookieName = "crm_active_account";

function baseSecret() {
  return process.env.CRM_SESSION_SECRET || "local-dev-secret";
}

export type CrmRole = "owner" | "guest";

export type CrmSessionPayload = {
  v: 1;
  uid: string;
  role: CrmRole;
  iat: number;
};

function b64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlJson(obj: any) {
  return b64url(JSON.stringify(obj));
}

function sign(data: string) {
  return b64url(crypto.createHmac("sha256", baseSecret()).update(data).digest());
}

export function makeSessionToken(payload: CrmSessionPayload) {
  const body = b64urlJson(payload);
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function parseSessionToken(token: string | undefined | null): CrmSessionPayload | null {
  const t = String(token || "");
  const [body, sig] = t.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const json = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    if (json?.v !== 1) return null;
    if (!json?.uid) return null;
    if (json?.role !== "owner" && json?.role !== "guest") return null;
    return json as CrmSessionPayload;
  } catch {
    return null;
  }
}

export async function authSessionFromCookies() {
  const c = await cookies();
  const v = c.get(sessionCookieName)?.value;
  return parseSessionToken(v);
}

export async function authRoleFromCookies() {
  const s = await authSessionFromCookies();
  return s?.role || null;
}

export function isAdminEmail(email: string) {
  return String(email || "").trim().toLowerCase() === "camlillico@gmail.com";
}
