import { NextResponse } from "next/server";
import { generateCodexReply, normalizeFileContexts } from "@/lib/codex-api";
import {
  appendCodexMessage,
  deriveThreadTitleFromMessage,
  getCodexThread,
  listCodexMessages,
  updateCodexThreadTitle,
} from "@/lib/codex-store";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";

function sanitizeMessage(input: unknown) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .trim();
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await requireCrmSession();
    const { threadId } = await ctx.params;
    const thread = await getCodexThread(session.uid, threadId);
    if (!thread) {
      return NextResponse.json({ ok: false, error: "THREAD_NOT_FOUND" }, { status: 404 });
    }
    const messages = await listCodexMessages(session.uid, threadId, 400);
    return NextResponse.json({ ok: true, thread, messages });
  } catch (error) {
    const code = String((error as Error)?.message || "");
    const status = code === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: code || "MESSAGES_READ_FAILED" }, { status });
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await requireCrmSession();
    const { threadId } = await ctx.params;
    const thread = await getCodexThread(session.uid, threadId);
    if (!thread) {
      return NextResponse.json({ ok: false, error: "THREAD_NOT_FOUND" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const prompt = sanitizeMessage(body?.message);
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "PROMPT_REQUIRED" }, { status: 400 });
    }

    const fileContexts = normalizeFileContexts(body?.fileContexts);
    const userMessage = await appendCodexMessage({
      userId: session.uid,
      threadId,
      role: "user",
      content: prompt,
      meta: fileContexts.length
        ? {
            attachedFiles: fileContexts.map((item) => item.name),
          }
        : undefined,
    });

    if (!thread.messageCount) {
      const title = deriveThreadTitleFromMessage(prompt);
      await updateCodexThreadTitle(session.uid, threadId, title);
    }

    const history = await listCodexMessages(session.uid, threadId, 80);
    const reply = await generateCodexReply({
      userId: session.uid,
      prompt,
      history,
      fileContexts,
      model: body?.model || thread.model,
    });

    const assistantMessage = await appendCodexMessage({
      userId: session.uid,
      threadId,
      role: "assistant",
      content: reply.text,
      meta: {
        model: reply.model,
        usage: reply.usage || undefined,
      },
    });

    const updatedThread = await getCodexThread(session.uid, threadId);

    return NextResponse.json({
      ok: true,
      thread: updatedThread,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    const code = String((error as Error)?.message || "");

    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    if (code === "PROMPT_REQUIRED" || code === "PROMPT_TOO_LARGE" || code === "CONTEXT_TOO_LARGE") {
      return NextResponse.json({ ok: false, error: code }, { status: 400 });
    }
    if (code === "RATE_LIMITED") {
      return NextResponse.json({ ok: false, error: code }, { status: 429 });
    }
    if (code === "OPENAI_KEY_MISSING") {
      return NextResponse.json({ ok: false, error: code }, { status: 500 });
    }
    if (code.startsWith("OPENAI_ERROR:")) {
      return NextResponse.json({ ok: false, error: code }, { status: 502 });
    }

    return NextResponse.json({ ok: false, error: code || "MESSAGE_SEND_FAILED" }, { status: 500 });
  }
}
