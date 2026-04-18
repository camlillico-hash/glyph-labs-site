import { NextResponse } from "next/server";
import { runCodexAgentTask } from "@/lib/codex-agent";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireCrmSession();
    const body = await req.json().catch(() => ({}));
    const task = String(body?.task || "").trim();
    const repoAlias = String(body?.repoAlias || "").trim() || undefined;
    const model = String(body?.model || "").trim() || undefined;
    const result = await runCodexAgentTask({
      task,
      repoAlias,
      model,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    if (code === "TASK_REQUIRED" || code === "TASK_TOO_LARGE" || code === "REPO_NOT_AVAILABLE") {
      return NextResponse.json({ ok: false, error: code }, { status: 400 });
    }
    if (code === "OPENAI_KEY_MISSING") {
      return NextResponse.json({ ok: false, error: code }, { status: 500 });
    }
    if (code.startsWith("OPENAI_ERROR:")) {
      return NextResponse.json({ ok: false, error: code }, { status: 502 });
    }
    return NextResponse.json({ ok: false, error: code || "AGENT_RUN_FAILED" }, { status: 500 });
  }
}
