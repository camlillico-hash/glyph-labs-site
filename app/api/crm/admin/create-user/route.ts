import { NextResponse } from "next/server";
import { requireCrmSession } from "@/lib/crm-scope";
import { createAccount, createUser, addUserToAccount } from "@/lib/crm-auth-store";
import { hashPassword } from "@/lib/crm-crypto";
import { id } from "@/lib/crm-store";
import { isAdminEmail } from "@/lib/crm-auth";

export async function POST(req: Request) {
  const session = await requireCrmSession();
  if (session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const accountName = String(body?.accountName || "").trim();

  if (!email || !password || !accountName) {
    return NextResponse.json({ error: "email, password, and accountName are required" }, { status: 400 });
  }

  const userId = id();
  const accountId = id();

  await createAccount({ id: accountId, name: accountName });
  await createUser({ id: userId, email, passwordHash: hashPassword(password), isAdmin: isAdminEmail(email) });
  await addUserToAccount({ accountId, userId, role: "owner" });

  return NextResponse.json({ ok: true, userId, accountId });
}
