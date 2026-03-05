import { NextResponse } from "next/server";
import { guestPassword, ownerPassword, roleCookieName, sessionCookieName, sessionToken } from "@/lib/crm-auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = body?.password || "";

  let role: "owner" | "guest" | null = null;
  if (password === ownerPassword()) role = "owner";
  else if (guestPassword() && password === guestPassword()) role = "guest";

  if (!role) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(sessionCookieName, sessionToken(role), {
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
  return res;
}
