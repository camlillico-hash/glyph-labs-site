import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/gmail";
import { resolveActiveAccountId } from "@/lib/crm-scope";

export async function GET() {
  const accountId = await resolveActiveAccountId();
  const url = getGoogleAuthUrl(accountId);
  if (!url) return NextResponse.json({ error: "Google OAuth not configured" }, { status: 400 });
  return NextResponse.redirect(url);
}
