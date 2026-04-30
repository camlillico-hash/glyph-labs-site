import { NextResponse } from "next/server";
import { getConfiguredCrmMcpAccountId, getCrmMcpApiKey, isCrmMcpConfigured, resolveCrmMcpAccountId } from "@/lib/crm-mcp-auth";
import { storageMode } from "@/lib/crm-store";

export async function GET() {
  const configuredAccountId = getConfiguredCrmMcpAccountId();
  const resolvedAccountId = await resolveCrmMcpAccountId(configuredAccountId || undefined).catch(() => "");

  return NextResponse.json({
    ok: true,
    mcpConfigured: isCrmMcpConfigured(),
    hasApiKey: Boolean(getCrmMcpApiKey()),
    configuredAccountId: configuredAccountId || null,
    resolvedAccountId: resolvedAccountId || null,
    storageMode: storageMode(),
  });
}
