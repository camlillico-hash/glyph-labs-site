import { NextResponse } from "next/server";
import { oauthResourceAliasMetadata } from "@/lib/crm-mcp-oauth";

const RESOURCE = "https://www.camlillico.com/api/crm/mcp";

export function GET() {
  const metadata = oauthResourceAliasMetadata(RESOURCE);
  if (!metadata) return NextResponse.json({ error: "OAuth is not configured" }, { status: 503 });
  return NextResponse.json(metadata, { headers: { "Cache-Control": "public, max-age=300" } });
}
