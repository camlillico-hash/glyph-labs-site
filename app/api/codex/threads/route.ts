import { NextResponse } from "next/server";
import { createCodexThread, listCodexThreads } from "@/lib/codex-store";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireCrmSession();
    const threads = await listCodexThreads(session.uid, 60);
    return NextResponse.json({ ok: true, threads });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    const status = code === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: code || "THREADS_READ_FAILED" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireCrmSession();
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || "").trim() || "New chat";
    const model = String(body?.model || "").trim() || undefined;
    const thread = await createCodexThread({
      userId: session.uid,
      title: title.slice(0, 120),
      model,
    });
    return NextResponse.json({ ok: true, thread }, { status: 201 });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    const status = code === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: code || "THREAD_CREATE_FAILED" }, { status });
  }
}
