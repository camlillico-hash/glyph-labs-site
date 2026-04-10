import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";
import { computeCoachMood } from "@/lib/coach-mood";
import { resolveActiveAccountId } from "@/lib/crm-scope";

export async function GET() {
  // Prefer scoped account data when a CRM session exists.
  // Keep endpoint resilient for unauthenticated or transient DB issues.
  try {
    const accountId = await resolveActiveAccountId();
    const store = await getStore(accountId);
    return NextResponse.json(computeCoachMood(store));
  } catch {}

  try {
    const store = await getStore();
    return NextResponse.json(computeCoachMood(store));
  } catch {
    return NextResponse.json(
      computeCoachMood({
        contacts: [],
        deals: [],
        tasks: [],
        activities: [],
      })
    );
  }
}
