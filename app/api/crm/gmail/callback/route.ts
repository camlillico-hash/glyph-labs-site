import { NextResponse } from "next/server";
import { storeGoogleCode } from "@/lib/gmail";
import { requireCrmSession } from "@/lib/crm-scope";
import { getUserAccountIds } from "@/lib/crm-auth-store";

export async function GET(req: Request) {
  const session = await requireCrmSession();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = String(searchParams.get("state") || "").trim();
  if (!code) return NextResponse.redirect(new URL("/crm/settings?gmail=error", req.url));

  const memberships = await getUserAccountIds(session.uid);
  const allowed = new Set(memberships.map((m) => m.account_id));
  const accountId = state && allowed.has(state) ? state : memberships[0]?.account_id;
  if (!accountId) {
    return NextResponse.redirect(new URL("/crm/settings?gmail=error&reason=no_account", req.url));
  }

  try {
    await storeGoogleCode(code, accountId);
    return NextResponse.redirect(new URL("/crm/settings?gmail=connected", req.url));
  } catch (e: any) {
    const msg = encodeURIComponent(String(e?.message || "unknown"));
    return NextResponse.redirect(new URL(`/crm/settings?gmail=error&reason=${msg}`, req.url));
  }
}
