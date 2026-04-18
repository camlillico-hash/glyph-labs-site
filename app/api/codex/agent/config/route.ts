import { NextResponse } from "next/server";
import { codexAgentConfig } from "@/lib/codex-agent";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireCrmSession();
    const config = codexAgentConfig();
    return NextResponse.json({ ok: true, ...config });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    const status = code === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: code || "AGENT_CONFIG_FAILED" }, { status });
  }
}
