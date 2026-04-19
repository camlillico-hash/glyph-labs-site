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
    const isRuntimeUnsupported =
      code.startsWith("AUTONOMY_RUNTIME_GIT_MISSING") ||
      code.startsWith("AUTONOMY_RUNTIME_READONLY");
    const isKnownGitWorktreeError =
      code.startsWith("GIT_STATUS_FAILED") ||
      code.startsWith("GIT_REPO_NOT_FOUND") ||
      code === "DIRTY_WORKTREE";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    if (
      code === "AUTONOMY_DISABLED" ||
      code === "WRITE_MODE_OFF" ||
      code === "RUN_NOT_FOUND" ||
      code === "RUN_NOT_REVERTABLE" ||
      isRuntimeUnsupported ||
      isKnownGitWorktreeError ||
      code === "GIT_REVERT_FAILED"
    ) {
      return NextResponse.json({ ok: false, error: code }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: code || "AUTONOMY_REVERT_FAILED" }, { status: 500 });
  }
}
