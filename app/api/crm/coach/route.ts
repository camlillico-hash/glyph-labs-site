import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";
import { computeCoachMood } from "@/lib/coach-mood";

export async function GET() {
  const store = await getStore();
  return NextResponse.json(computeCoachMood(store));
}
