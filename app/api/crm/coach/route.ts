import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";
import { computeCoachMood } from "@/lib/coach-mood";

export async function GET() {
  // Keep this endpoint public; it only returns UI mood/labels and
  // should not block shell rendering if a user isn't logged in yet.
  const store = await getStore();
  return NextResponse.json(computeCoachMood(store));
}
