import { NextResponse } from "next/server";
import { requireCrmSession } from "@/lib/crm-scope";
import { activeAccountCookieName } from "@/lib/crm-auth";

export async function POST(req: Request) {
  const session = await requireCrmSession();
  if (session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const accountId = String(body?.accountId || "").trim();
  if (!accountId) return NextResponse.json({ error: "accountId is required" }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(activeAccountCookieName, accountId, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
