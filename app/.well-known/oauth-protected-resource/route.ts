import { NextResponse } from "next/server";
import { oauthResourceMetadata } from "@/lib/crm-mcp-oauth";

export function GET() {
  const metadata = oauthResourceMetadata();
  if (!metadata) return NextResponse.json({ error: "OAuth is not configured" }, { status: 503 });
  return NextResponse.json(metadata, { headers: { "Cache-Control": "public, max-age=300" } });
}
