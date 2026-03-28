import { NextResponse } from "next/server";
import { requireCrmSession } from "@/lib/crm-scope";
import { addUserToAccount, getUserByEmail } from "@/lib/crm-auth-store";

export async function POST(req: Request) {
  try {
    const session = await requireCrmSession();
    if (session.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const accountId = String(body?.accountId || "").trim();
    const role = String(body?.role || "owner").trim() as "owner" | "admin" | "member";

    if (!email || !accountId) {
      return NextResponse.json({ error: "email and accountId are required" }, { status: 400 });
    }
    if (!["owner", "admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found for that email" }, { status: 404 });
    }

    await addUserToAccount({ accountId, userId: user.id, role });
    return NextResponse.json({ ok: true, userId: user.id, accountId, role });
  } catch (e: any) {
    const msg = String(e?.message || "Attach existing user failed");
    if (msg.includes("No database")) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
