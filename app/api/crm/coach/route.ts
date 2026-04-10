import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";
import { computeCoachMood } from "@/lib/coach-mood";
import { resolveActiveAccountId } from "@/lib/crm-scope";

export async function GET() {
  // Prefer scoped account data when a CRM session exists.
  // Keep endpoint resilient for unauthenticated render paths.
  let store;
  try {
    const accountId = await resolveActiveAccountId();
    store = await getStore(accountId);
  } catch {
    store = await getStore();
  }
  return NextResponse.json(computeCoachMood(store));
}
