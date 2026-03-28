import { NextResponse } from "next/server";
import { requireCrmSession } from "@/lib/crm-scope";
import { listAccounts } from "@/lib/crm-auth-store";

export async function GET() {
  const session = await requireCrmSession();
  if (session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const accounts = await listAccounts();
  return NextResponse.json({ accounts });
}
