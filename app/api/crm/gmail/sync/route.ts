import { NextResponse } from "next/server";
import { syncGmailMessages } from "@/lib/gmail";
import { resolveActiveAccountId } from "@/lib/crm-scope";

export async function POST(req: Request) {
  const wantsHtml = (req.headers.get("accept") || "").includes("text/html");
  try {
    const accountId = await resolveActiveAccountId();
    const result = await syncGmailMessages(accountId);
    if (wantsHtml) {
      const url = new URL("/crm/settings", req.url);
      url.searchParams.set("gmail", "synced");
      url.searchParams.set("count", String(result.count || 0));
      url.searchParams.set("activities", String(result.activitiesCreated || 0));
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    if (wantsHtml) {
      const url = new URL("/crm/settings", req.url);
      url.searchParams.set("gmail", "sync_error");
      url.searchParams.set("reason", String(e?.message || "Sync failed"));
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json({ ok: false, error: e.message || "Sync failed" }, { status: 400 });
  }
}
