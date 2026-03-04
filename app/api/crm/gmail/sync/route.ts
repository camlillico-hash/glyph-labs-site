import { NextResponse } from "next/server";
import { syncGmailMessages } from "@/lib/gmail";

export async function POST() {
  try {
    const result = await syncGmailMessages();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Sync failed" }, { status: 400 });
  }
}
