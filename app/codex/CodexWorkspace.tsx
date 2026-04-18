"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Loader2, MessageSquare, Plus, Send, X } from "lucide-react";

type Thread = {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

type Attachment = {
  id: string;
  name: string;
  content: string;
};

const MODEL_OPTIONS = ["gpt-5.4-mini", "gpt-5.4", "gpt-5.2"] as const;

function formatDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function localId() {
  return Math.random().toString(36).slice(2);
}

export default function CodexWorkspace() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [model, setModel] = useState<string>(MODEL_OPTIONS[0]);
  const [threadSearch, setThreadSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const deferredSearch = useDeferredValue(threadSearch);

  const visibleThreads = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => thread.title.toLowerCase().includes(q));
  }, [deferredSearch, threads]);

  useEffect(() => {
    void loadThreads();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  async function loadThreads() {
    setIsLoadingThreads(true);
    setError("");
    try {
      const res = await fetch("/api/codex/threads", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "THREADS_READ_FAILED"));
      }
      const nextThreads = Array.isArray(data.threads) ? data.threads : [];
      setThreads(nextThreads);
      if (nextThreads.length > 0) {
        const nextActive = activeThreadId && nextThreads.some((thread: Thread) => thread.id === activeThreadId)
          ? activeThreadId
          : String(nextThreads[0].id);
        setActiveThreadId(nextActive);
        setModel(String(nextThreads.find((thread: Thread) => thread.id === nextActive)?.model || MODEL_OPTIONS[0]));
        await loadMessages(nextActive);
      } else {
        setActiveThreadId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(String((err as Error)?.message || "Failed to load chats."));
    } finally {
      setIsLoadingThreads(false);
    }
  }

  async function loadMessages(threadId: string) {
    setIsLoadingMessages(true);
    setError("");
    try {
      const res = await fetch(`/api/codex/threads/${threadId}/messages`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "MESSAGES_READ_FAILED"));
      }
      const nextMessages = Array.isArray(data.messages) ? data.messages : [];
      setMessages(nextMessages);
      if (data?.thread?.model) setModel(String(data.thread.model));
    } catch (err) {
      setError(String((err as Error)?.message || "Failed to load messages."));
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  async function createThread() {
    setError("");
    const res = await fetch("/api/codex/threads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data?.thread?.id) {
      throw new Error(String(data?.error || "THREAD_CREATE_FAILED"));
    }
    const thread = data.thread as Thread;
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setMessages([]);
    return thread.id;
  }

  async function pickThread(threadId: string) {
    setActiveThreadId(threadId);
    const selected = threads.find((thread) => thread.id === threadId);
    if (selected?.model) setModel(selected.model);
    await loadMessages(threadId);
  }

  async function handleAttachFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || !files.length) return;
    const next: Attachment[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      const text = await file.text().catch(() => "");
      if (!text.trim()) continue;
      next.push({
        id: localId(),
        name: file.name,
        content: text.slice(0, 6000),
      });
    }
    setAttachments((prev) => [...prev, ...next].slice(0, 4));
    event.target.value = "";
  }

  async function sendPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError("");
    const promptToSend = trimmed;
    setPrompt("");

    try {
      let threadId = activeThreadId;
      if (!threadId) {
        threadId = await createThread();
      }

      const res = await fetch(`/api/codex/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          model,
          fileContexts: attachments.map((file) => ({
            name: file.name,
            content: file.content,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "MESSAGE_SEND_FAILED"));
      }

      setAttachments([]);
      setMessages((prev) => [...prev, data.userMessage, data.assistantMessage].filter(Boolean));

      if (data?.thread) {
        setThreads((prev) => {
          const remaining = prev.filter((item) => item.id !== data.thread.id);
          return [data.thread, ...remaining];
        });
        setActiveThreadId(String(data.thread.id));
        if (data.thread.model) setModel(String(data.thread.model));
      } else {
        await loadThreads();
      }
    } catch (err) {
      setPrompt(promptToSend);
      setError(String((err as Error)?.message || "Failed to send message."));
    } finally {
      setIsSending(false);
    }
  }

  const activeThread = threads.find((thread) => thread.id === activeThreadId) || null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col px-3 py-3 md:h-screen md:flex-row md:gap-4 md:px-4 md:py-4">
        <aside className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 md:mb-0 md:w-[320px] md:shrink-0 md:overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Codex</p>
              <h1 className="mt-1 text-lg font-semibold">Private Workspace</h1>
            </div>
            <button
              type="button"
              onClick={() => void createThread()}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
            >
              <Plus size={14} />
              New
            </button>
          </div>

          <input
            value={threadSearch}
            onChange={(e) => setThreadSearch(e.target.value)}
            placeholder="Search chats..."
            className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
          />

          <div className="max-h-[30vh] space-y-2 overflow-y-auto pr-1 md:max-h-[calc(100vh-190px)]">
            {isLoadingThreads && <p className="text-sm text-slate-400">Loading chats...</p>}
            {!isLoadingThreads && visibleThreads.length === 0 && (
              <p className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
                No chats yet. Start one with “New”.
              </p>
            )}
            {visibleThreads.map((thread) => {
              const active = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => void pickThread(thread.id)}
                  className={`w-full cursor-pointer rounded-md border px-3 py-2 text-left transition ${
                    active
                      ? "border-cyan-500/60 bg-slate-800"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <p className="truncate text-sm font-medium text-slate-100">{thread.title || "New chat"}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(thread.updatedAt)}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/80">
          <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {activeThread?.title || "New chat"}
              </p>
              <p className="text-xs text-slate-400">Authenticated with your CRM session</p>
            </div>
            <label className="text-xs text-slate-300">
              Model
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="ml-2 cursor-pointer rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
              >
                {MODEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </header>

          <div
            ref={scrollRef}
            className="h-[46vh] space-y-3 overflow-y-auto px-4 py-4 md:h-[calc(100vh-248px)]"
          >
            {isLoadingMessages && <p className="text-sm text-slate-400">Loading messages...</p>}
            {!isLoadingMessages && messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-5 text-sm text-slate-400">
                <p className="inline-flex items-center gap-2">
                  <MessageSquare size={16} />
                  Start with a prompt. You can also attach text files for context.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-6 md:max-w-[78%] ${
                    message.role === "user"
                      ? "border border-cyan-500/40 bg-cyan-500/10 text-cyan-50"
                      : "border border-slate-700 bg-slate-950 text-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-slate-800 px-4 py-3">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <span
                    key={file.id}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200"
                  >
                    <FileText size={12} />
                    {file.name}
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((item) => item.id !== file.id))}
                      className="cursor-pointer text-slate-400 hover:text-slate-100"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendPrompt();
                  }
                }}
                placeholder="Ask Codex to build, debug, or explain..."
                className="min-h-[92px] flex-1 resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
              />

              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800">
                  Context
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.csv,.json,.ts,.tsx,.js,.jsx,.py,.sql"
                    onChange={(e) => void handleAttachFiles(e)}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void sendPrompt()}
                  disabled={isSending || !prompt.trim()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-cyan-500/30"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send
                </button>
              </div>
            </div>

            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </footer>
        </section>
      </div>
    </main>
  );
}
