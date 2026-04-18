import { NextResponse } from "next/server";
import { getAutonomyRun } from "@/lib/codex-autonomy";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ runId: string }> }
) {
  try {
    const session = await requireCrmSession();
    const { runId } = await ctx.params;
    const run = await getAutonomyRun(session.uid, runId);
    if (!run) {
      return NextResponse.json({ ok: false, error: "RUN_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, run });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: code || "AUTONOMY_RUN_READ_FAILED" }, { status: 500 });
  }
}
