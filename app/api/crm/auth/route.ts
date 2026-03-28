import { NextResponse } from "next/server";
import { roleCookieName, sessionCookieName, makeSessionToken, isAdminEmail } from "@/lib/crm-auth";
import { getUserByEmail } from "@/lib/crm-auth-store";
import { verifyPassword } from "@/lib/crm-crypto";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
  }

  const user = await getUserByEmail(email).catch(() => null);
  if (!user) {
    // DEBUG: helps identify whether we're failing lookup vs verification.
    return NextResponse.json({ ok: false, where: "no_user" }, { status: 401 });
  }

  let passOk = false;
  try {
    passOk = verifyPassword(password, user.password_hash);
  } catch (e: any) {
    // DEBUG: verifyPassword can throw (e.g., malformed stored hash).
    return NextResponse.json({ ok: false, where: "verify_throw", message: String(e?.message || e) }, { status: 401 });
  }

  if (!passOk) {
    return NextResponse.json({ ok: false, where: "bad_password" }, { status: 401 });
  }

  const role = (user.is_admin || isAdminEmail(user.email)) ? ("owner" as const) : ("guest" as const);

  const token = makeSessionToken({ v: 1, uid: user.id, role, iat: Date.now() });
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  res.cookies.set(roleCookieName, role, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName, "", { path: "/", maxAge: 0 });
  res.cookies.set(roleCookieName, "", { path: "/", maxAge: 0 });
  res.cookies.set("crm_active_account", "", { path: "/", maxAge: 0 });
  return res;
}
