import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";

export async function GET() {
  const store = await getStore();
  return NextResponse.json(store.gmail.messages || []);
}
