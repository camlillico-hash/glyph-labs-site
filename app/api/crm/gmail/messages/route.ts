import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";
import { resolveActiveAccountId } from "@/lib/crm-scope";

export async function GET() {
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  return NextResponse.json(store.gmail.messages || []);
}
