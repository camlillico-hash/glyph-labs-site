import { NextResponse } from "next/server";
import { revertAutonomyRun } from "@/lib/codex-autonomy";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ runId: string }> }
) {
  try {
    const session = await requireCrmSession();
    const { runId } = await ctx.params;
    const run = await revertAutonomyRun({
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
      code === "RUN_NOT_REVERTABLE" ||
      code === "DIRTY_WORKTREE" ||
      code === "GIT_REVERT_FAILED"
    ) {
      return NextResponse.json({ ok: false, error: code }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: code || "AUTONOMY_REVERT_FAILED" }, { status: 500 });
  }
}
