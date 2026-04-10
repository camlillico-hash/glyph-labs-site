import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";
import { resolveActiveAccountId } from "@/lib/crm-scope";

export async function GET() {
  try {
    const accountId = await resolveActiveAccountId();
    const store = await getStore(accountId);
    return NextResponse.json({
      contacts: Array.isArray(store.contacts) ? store.contacts : [],
      activities: Array.isArray(store.activities) ? store.activities : [],
      tasks: Array.isArray(store.tasks) ? store.tasks : [],
      deals: Array.isArray(store.deals) ? store.deals : [],
      gmailMessages: Array.isArray(store.gmail?.messages) ? store.gmail.messages : [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Could not load CRM snapshot" }, { status: 401 });
  }
}
