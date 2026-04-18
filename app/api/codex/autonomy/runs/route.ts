import { NextResponse } from "next/server";
import { createAutonomyRun } from "@/lib/codex-autonomy";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await requireCrmSession();
    const body = await req.json().catch(() => ({}));
    const task = String(body?.task || "").trim();
    const targetArea = String(body?.targetArea || "").trim().toLowerCase();
    const model = String(body?.model || "").trim() || undefined;
    const run = await createAutonomyRun({
      userId: session.uid,
      task,
      targetArea: targetArea as "coaching" | "crm" | "codex",
      model,
    });
    return NextResponse.json({ ok: true, run }, { status: 201 });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    if (
      code === "AUTONOMY_DISABLED" ||
      code === "TASK_REQUIRED" ||
      code === "TASK_TOO_LARGE" ||
      code === "TARGET_AREA_INVALID" ||
      code.startsWith("DISALLOWED_PATH:") ||
      code.startsWith("OUTSIDE_TARGET_AREA:") ||
      code.startsWith("INVALID_PATH:") ||
      code === "NO_VALID_OPERATIONS" ||
      code === "NO_APPLICABLE_OPERATIONS" ||
      code === "AUTONOMY_PLAN_PARSE_FAILED"
    ) {
      return NextResponse.json({ ok: false, error: code }, { status: 400 });
    }
    if (code === "OPENAI_KEY_MISSING") {
      return NextResponse.json({ ok: false, error: code }, { status: 500 });
    }
    if (code.startsWith("OPENAI_ERROR:")) {
      return NextResponse.json({ ok: false, error: code }, { status: 502 });
    }
    return NextResponse.json({ ok: false, error: code || "AUTONOMY_CREATE_FAILED" }, { status: 500 });
  }
}
