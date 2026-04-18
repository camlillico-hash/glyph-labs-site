import { NextResponse } from "next/server";
import { approveAutonomyRun } from "@/lib/codex-autonomy";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ runId: string }> }
) {
  try {
    const session = await requireCrmSession();
    const { runId } = await ctx.params;
    const run = await approveAutonomyRun({
      userId: session.uid,
      runId,
    });
    return NextResponse.json({ ok: true, run });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    if (
      code === "AUTONOMY_DISABLED" ||
      code === "WRITE_MODE_OFF" ||
      code === "RUN_NOT_FOUND" ||
      code === "RUN_NOT_APPROVABLE" ||
      code === "MAX_CONCURRENT_RUNS_REACHED" ||
      code === "DIRTY_WORKTREE"
    ) {
      return NextResponse.json({ ok: false, error: code }, { status: 400 });
    }
    if (code === "OPENAI_KEY_MISSING") {
      return NextResponse.json({ ok: false, error: code }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: code || "AUTONOMY_APPROVE_FAILED" }, { status: 500 });
  }
}
