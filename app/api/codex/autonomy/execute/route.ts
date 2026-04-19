import { NextResponse } from "next/server";
import {
  executeAutonomyRevertOnCurrentHost,
  executeAutonomyRunOnCurrentHost,
  type AutonomyRun,
} from "@/lib/codex-autonomy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asText(value: unknown) {
  return String(value || "").trim();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireExecutorSecret(req: Request) {
  const configured = asText(process.env.CODEX_AUTONOMY_EXECUTOR_SECRET);
  if (!configured) throw new Error("AUTONOMY_EXECUTOR_SECRET_MISSING");
  const provided = asText(req.headers.get("x-codex-autonomy-secret"));
  if (!provided || provided !== configured) throw new Error("AUTONOMY_EXECUTOR_UNAUTHORIZED");
}

function parseRun(body: unknown): AutonomyRun {
  const root = isObject(body) ? body : {};
  const run = isObject(root.run) ? root.run : null;
  if (!run) throw new Error("AUTONOMY_EXECUTOR_PAYLOAD_INVALID");

  const id = asText(run.id);
  const task = asText(run.task);
  const status = asText(run.status);
  const stage = asText(run.stage);
  const operations = isObject(run.plan) && Array.isArray(run.plan.operations) ? run.plan.operations : null;
  const route = isObject(run.policy) ? asText(run.policy.route) : "";
  if (!id || !task || !status || !stage || !operations || !route) {
    throw new Error("AUTONOMY_EXECUTOR_PAYLOAD_INVALID");
  }
  return run as unknown as AutonomyRun;
}

export async function POST(req: Request) {
  try {
    requireExecutorSecret(req);
    const body = await req.json().catch(() => ({}));
    const action = isObject(body) ? asText(body.action || "run") : "run";
    const run = parseRun(body);
    const result =
      action === "revert"
        ? await executeAutonomyRevertOnCurrentHost(run)
        : await executeAutonomyRunOnCurrentHost(run);
    return NextResponse.json(
      { ok: true, result },
      { headers: { "cache-control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const code = asText((error as Error)?.message || "AUTONOMY_EXECUTOR_FAILED");
    if (code === "AUTONOMY_EXECUTOR_UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    if (
      code === "AUTONOMY_EXECUTOR_SECRET_MISSING" ||
      code === "AUTONOMY_EXECUTOR_PAYLOAD_INVALID"
    ) {
      return NextResponse.json({ ok: false, error: code }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: code }, { status: 500 });
  }
}
