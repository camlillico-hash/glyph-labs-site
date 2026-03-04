import { NextResponse } from "next/server";
import { expectedPassword, sessionCookieName, sessionCookieValue } from "@/lib/crm-auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = body?.password || "";

  if (password !== expectedPassword()) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName, sessionCookieValue(), {
    httpOnly: true,
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
  return res;
}
