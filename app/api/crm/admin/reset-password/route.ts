import { NextResponse } from "next/server";
import { requireCrmSession } from "@/lib/crm-scope";
import { getUserByEmail, updateUserPassword } from "@/lib/crm-auth-store";
import { hashPassword } from "@/lib/crm-crypto";

export async function POST(req: Request) {
  try {
    const session = await requireCrmSession();
    if (session.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found for that email" }, { status: 404 });
    }

    await updateUserPassword({ userId: user.id, passwordHash: hashPassword(password) });
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e: any) {
    const msg = String(e?.message || "Reset password failed");
    if (msg.includes("No database")) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
