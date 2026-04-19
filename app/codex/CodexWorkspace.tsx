"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FileText, Loader2, MessageSquare, Plus, Send, TerminalSquare, X } from "lucide-react";

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

type AgentRepo = {
  alias: string;
  path: string;
};

type AgentStep = {
  command: string;
  blocked: boolean;
  blockedReason?: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
};

type AgentResult = {
  mode: "local";
  repo: AgentRepo;
  planReasoning: string;
  commands: string[];
  steps: AgentStep[];
  summary: string;
  warnings: string[];
};

type PolicyRoute = "direct_main" | "pr_required";

type AutonomyRun = {
  id: string;
  task: string;
  targetArea: "coaching" | "crm" | "codex";
  stage: string;
  status: "pending_approval" | "running" | "completed" | "failed";
  policy: {
    route: PolicyRoute;
    reason: string;
    touchedPaths: string[];
  };
  plan: {
    reasoning: string;
    summary: string;
    warnings: string[];
    operations: Array<{
      path: string;
      find: string;
      replace: string;
      replaceAll?: boolean;
    }>;
  };
  proposedDiff: {
    items: Array<{
      path: string;
      beforeSnippet: string;
      afterSnippet: string;
    }>;
  };
  verification?: {
    passed: boolean;
    checks: Array<{
      name: string;
      command: string;
      exitCode: number | null;
      passed: boolean;
      stdout: string;
      stderr: string;
      durationMs: number;
    }>;
  };
  ship?: {
    route: PolicyRoute;
    mode: "direct" | "pr";
    branch: string;
    commitSha: string;
    compareUrl?: string;
    prUrl?: string;
  };
  revert?: {
    branch: string;
    commitSha: string;
    compareUrl?: string;
    prUrl?: string;
  };
  error?: string;
  approvedAt?: string;
  completedAt?: string;
  failedAt?: string;
};

type RuntimeVersion = {
  commitSha: string;
  commitShort: string;
  branch: string;
};

const DEFAULT_MODEL = "gpt-5.4";
const MODEL_OPTIONS = [DEFAULT_MODEL, "gpt-5.2", "gpt-5.4-mini"] as const;
const AUTONOMY_TARGET_OPTIONS = [
  { value: "coaching", label: "/coaching" },
  { value: "crm", label: "/crm" },
  { value: "codex", label: "/codex" },
] as const;

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
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [threadSearch, setThreadSearch] = useState("");
  const [autonomyTask, setAutonomyTask] = useState("");
  const [autonomyTargetArea, setAutonomyTargetArea] = useState<"coaching" | "crm" | "codex">("coaching");
  const [autonomyOpen, setAutonomyOpen] = useState(false);
  const [autonomyCreating, setAutonomyCreating] = useState(false);
  const [autonomyApproving, setAutonomyApproving] = useState(false);
  const [autonomyReverting, setAutonomyReverting] = useState(false);
  const [autonomyError, setAutonomyError] = useState("");
  const [autonomyRun, setAutonomyRun] = useState<AutonomyRun | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentTask, setAgentTask] = useState("");
  const [agentRepos, setAgentRepos] = useState<AgentRepo[]>([]);
  const [agentRepoAlias, setAgentRepoAlias] = useState("");
  const [agentLoadingConfig, setAgentLoadingConfig] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [runtimeVersion, setRuntimeVersion] = useState<RuntimeVersion | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const deferredSearch = useDeferredValue(threadSearch);

  const visibleThreads = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => thread.title.toLowerCase().includes(q));
  }, [deferredSearch, threads]);

  useEffect(() => {
    void loadThreads();
    void loadAgentConfig();
    void loadRuntimeVersion();
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
        await loadMessages(nextActive);
      } else {
        setActiveThreadId(null);
        setMessages([]);
        setModel(DEFAULT_MODEL);
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
    } catch (err) {
      setError(String((err as Error)?.message || "Failed to load messages."));
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  async function loadAgentConfig() {
    setAgentLoadingConfig(true);
    setAgentError("");
    try {
      const res = await fetch("/api/codex/agent/config", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "AGENT_CONFIG_FAILED"));
      }
      const repos = Array.isArray(data.repos) ? (data.repos as AgentRepo[]) : [];
      setAgentRepos(repos);
      setAgentRepoAlias((current) => current || String(repos[0]?.alias || ""));
    } catch (err) {
      setAgentError(String((err as Error)?.message || "Agent config failed."));
      setAgentRepos([]);
      setAgentRepoAlias("");
    } finally {
      setAgentLoadingConfig(false);
    }
  }

  async function loadRuntimeVersion() {
    try {
      const res = await fetch("/api/codex/version", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return;
      setRuntimeVersion({
        commitSha: String(data.commitSha || ""),
        commitShort: String(data.commitShort || ""),
        branch: String(data.branch || ""),
      });
    } catch {
      // no-op: version info is diagnostic only
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

  async function runAgentTask() {
    const task = agentTask.trim();
    if (!task || agentRunning) return;

    setAgentRunning(true);
    setAgentError("");
    setAgentResult(null);
    try {
      const res = await fetch("/api/codex/agent/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          task,
          repoAlias: agentRepoAlias || undefined,
          model,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "AGENT_RUN_FAILED"));
      }
      setAgentResult(data.result as AgentResult);
    } catch (err) {
      setAgentError(String((err as Error)?.message || "Agent run failed."));
    } finally {
      setAgentRunning(false);
    }
  }

  async function createAutonomyRun() {
    const task = autonomyTask.trim();
    if (!task || autonomyCreating) return;
    setAutonomyCreating(true);
    setAutonomyError("");
    setAutonomyRun(null);
    try {
      const res = await fetch("/api/codex/autonomy/runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          task,
          targetArea: autonomyTargetArea,
          model,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "AUTONOMY_CREATE_FAILED"));
      }
      setAutonomyRun(data.run as AutonomyRun);
    } catch (err) {
      setAutonomyError(String((err as Error)?.message || "Could not create autonomy run."));
    } finally {
      setAutonomyCreating(false);
    }
  }

  async function refreshAutonomyRun(runId: string) {
    const res = await fetch(`/api/codex/autonomy/runs/${runId}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(String(data?.error || "AUTONOMY_RUN_READ_FAILED"));
    }
    setAutonomyRun(data.run as AutonomyRun);
  }

  async function approveAutonomyRun() {
    if (!autonomyRun || autonomyApproving) return;
    setAutonomyApproving(true);
    setAutonomyError("");
    try {
      const res = await fetch(`/api/codex/autonomy/runs/${autonomyRun.id}/approve`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "AUTONOMY_APPROVE_FAILED"));
      }
      setAutonomyRun(data.run as AutonomyRun);
    } catch (err) {
      setAutonomyError(String((err as Error)?.message || "Approval/apply failed."));
      try {
        await refreshAutonomyRun(autonomyRun.id);
      } catch {
        // no-op
      }
    } finally {
      setAutonomyApproving(false);
    }
  }

  async function revertAutonomyRun() {
    if (!autonomyRun || autonomyReverting) return;
    setAutonomyReverting(true);
    setAutonomyError("");
    try {
      const res = await fetch(`/api/codex/autonomy/runs/${autonomyRun.id}/revert`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(String(data?.error || "AUTONOMY_REVERT_FAILED"));
      }
      setAutonomyRun(data.run as AutonomyRun);
    } catch (err) {
      setAutonomyError(String((err as Error)?.message || "Rollback failed."));
      try {
        await refreshAutonomyRun(autonomyRun.id);
      } catch {
        // no-op
      }
    } finally {
      setAutonomyReverting(false);
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
              {runtimeVersion?.commitShort ? (
                <span className="ml-2 text-[10px] text-slate-400">
                  backend {runtimeVersion.commitShort}
                  {runtimeVersion.branch ? `@${runtimeVersion.branch}` : ""}
                </span>
              ) : null}
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
            <div className="mb-3 rounded-md border border-slate-700 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setAutonomyOpen((open) => !open)}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm font-semibold text-slate-100 hover:bg-slate-900"
              >
                <span className="inline-flex items-center gap-2">
                  <TerminalSquare size={14} className="text-cyan-300" />
                  Autonomous Task (Plan {">"} Diff {">"} Approve {">"} Ship)
                </span>
                <ChevronDown
                  size={14}
                  className={`transition ${autonomyOpen ? "rotate-180 text-cyan-300" : "text-slate-400"}`}
                />
              </button>

              {autonomyOpen && (
                <div className="border-t border-slate-800 px-3 py-3">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="text-xs text-slate-300">
                      Target
                      <select
                        value={autonomyTargetArea}
                        onChange={(e) => setAutonomyTargetArea(e.target.value as "coaching" | "crm" | "codex")}
                        className="ml-2 cursor-pointer rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                      >
                        {AUTONOMY_TARGET_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="text-xs text-slate-400">
                      Hybrid policy: coaching/codex UI can ship direct; CRM/backend forces PR.
                    </span>
                  </div>

                  <textarea
                    value={autonomyTask}
                    onChange={(e) => setAutonomyTask(e.target.value)}
                    placeholder="Describe the exact change you want."
                    className="min-h-[88px] w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Single approval gate before writes.</p>
                    <button
                      type="button"
                      onClick={() => void createAutonomyRun()}
                      disabled={autonomyCreating || !autonomyTask.trim()}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-sm font-semibold text-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-cyan-500/30"
                    >
                      {autonomyCreating ? <Loader2 size={14} className="animate-spin" /> : <TerminalSquare size={14} />}
                      Generate plan
                    </button>
                  </div>

                  {autonomyError && <p className="mt-2 text-sm text-red-300">{autonomyError}</p>}

                  {autonomyRun && (
                    <div className="mt-3 rounded-md border border-slate-700 bg-slate-900/70 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.12em] text-cyan-300">
                          {autonomyRun.status}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] ${
                            autonomyRun.policy.route === "direct_main"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-200"
                          }`}
                        >
                          {autonomyRun.policy.route === "direct_main" ? "Direct Main" : "PR Required"}
                        </span>
                        <span className="text-xs text-slate-400">Run #{autonomyRun.id.slice(0, 8)}</span>
                      </div>

                      <p className="mt-2 text-xs text-slate-300">{autonomyRun.policy.reason}</p>
                      <p className="mt-2 text-sm text-slate-100">{autonomyRun.plan.summary}</p>
                      <p className="mt-1 text-xs text-slate-400">{autonomyRun.plan.reasoning}</p>

                      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-cyan-300">Proposed diff</p>
                      <div className="mt-1 space-y-2">
                        {autonomyRun.proposedDiff.items.map((item, idx) => (
                          <div key={`${item.path}-${idx}`} className="rounded border border-slate-700 bg-slate-950 p-2">
                            <p className="text-xs font-semibold text-slate-200">{item.path}</p>
                            <p className="mt-1 text-[11px] text-rose-200">- {item.beforeSnippet}</p>
                            <p className="mt-1 text-[11px] text-emerald-200">+ {item.afterSnippet}</p>
                          </div>
                        ))}
                      </div>

                      {autonomyRun.plan.warnings.length > 0 && (
                        <div className="mt-2 rounded border border-amber-600/40 bg-amber-500/10 p-2">
                          {autonomyRun.plan.warnings.map((warning, idx) => (
                            <p key={`${warning}-${idx}`} className="text-xs text-amber-200">
                              {warning}
                            </p>
                          ))}
                        </div>
                      )}

                      {autonomyRun.status === "pending_approval" && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void approveAutonomyRun()}
                            disabled={autonomyApproving}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-sm font-semibold text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-emerald-500/30"
                          >
                            {autonomyApproving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Approve and apply
                          </button>
                        </div>
                      )}

                      {autonomyRun.verification && (
                        <>
                          <p className="mt-3 text-xs uppercase tracking-[0.12em] text-cyan-300">Verification</p>
                          <div className="mt-1 space-y-2">
                            {autonomyRun.verification.checks.map((check, idx) => (
                              <div key={`${check.command}-${idx}`} className="rounded border border-slate-700 bg-slate-950 p-2">
                                <p className="text-xs font-semibold text-slate-200">{check.name}</p>
                                <p className="text-[11px] text-slate-400">{check.command}</p>
                                <p className={`mt-1 text-[11px] ${check.passed ? "text-emerald-200" : "text-rose-200"}`}>
                                  {check.passed ? "passed" : "failed"} • exit={String(check.exitCode)} • {check.durationMs}ms
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {autonomyRun.ship && (
                        <div className="mt-3 rounded border border-slate-700 bg-slate-950 p-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Ship result</p>
                          <p className="mt-1 text-xs text-slate-200">
                            {autonomyRun.ship.mode === "direct" ? "Pushed to main" : "PR branch pushed"} •{" "}
                            <span className="font-mono">{autonomyRun.ship.commitSha.slice(0, 12)}</span>
                          </p>
                          {autonomyRun.ship.prUrl && (
                            <a
                              href={autonomyRun.ship.prUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-xs text-cyan-300 underline decoration-cyan-500/50 underline-offset-2"
                            >
                              Open PR link
                            </a>
                          )}
                        </div>
                      )}

                      {autonomyRun.error && (
                        <p className="mt-2 text-sm text-rose-300">Run error: {autonomyRun.error}</p>
                      )}

                      {autonomyRun.status === "completed" && !autonomyRun.revert && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void revertAutonomyRun()}
                            disabled={autonomyReverting}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-sm font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-amber-500/30"
                          >
                            {autonomyReverting ? <Loader2 size={14} className="animate-spin" /> : <TerminalSquare size={14} />}
                            Revert via PR
                          </button>
                        </div>
                      )}

                      {autonomyRun.revert?.prUrl && (
                        <a
                          href={autonomyRun.revert.prUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-cyan-300 underline decoration-cyan-500/50 underline-offset-2"
                        >
                          Open revert PR link
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-3 rounded-md border border-slate-700 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setAgentOpen((open) => !open)}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm font-semibold text-slate-100 hover:bg-slate-900"
              >
                <span className="inline-flex items-center gap-2">
                  <TerminalSquare size={14} className="text-cyan-300" />
                  Agent Task Runner (Beta)
                </span>
                <ChevronDown
                  size={14}
                  className={`transition ${agentOpen ? "rotate-180 text-cyan-300" : "text-slate-400"}`}
                />
              </button>

              {agentOpen && (
                <div className="border-t border-slate-800 px-3 py-3">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="text-xs text-slate-300">
                      Repo
                      <select
                        value={agentRepoAlias}
                        onChange={(e) => setAgentRepoAlias(e.target.value)}
                        disabled={agentLoadingConfig || !agentRepos.length}
                        className="ml-2 cursor-pointer rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {agentRepos.map((repo) => (
                          <option key={repo.alias} value={repo.alias}>
                            {repo.alias}
                          </option>
                        ))}
                      </select>
                    </label>
                    {agentLoadingConfig && (
                      <span className="text-xs text-slate-400">Loading repos...</span>
                    )}
                  </div>

                  <textarea
                    value={agentTask}
                    onChange={(e) => setAgentTask(e.target.value)}
                    placeholder="Example: investigate why /codex returns OPENAI_KEY_MISSING and propose a fix"
                    className="min-h-[84px] w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Strict allowlist + capped runtime/output.
                    </p>
                    <button
                      type="button"
                      onClick={() => void runAgentTask()}
                      disabled={agentRunning || !agentTask.trim()}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-sm font-semibold text-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-cyan-500/30"
                    >
                      {agentRunning ? <Loader2 size={14} className="animate-spin" /> : <TerminalSquare size={14} />}
                      Run
                    </button>
                  </div>

                  {agentError && <p className="mt-2 text-sm text-red-300">{agentError}</p>}

                  {agentResult && (
                    <div className="mt-3 rounded-md border border-slate-700 bg-slate-900/70 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Summary</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-100">{agentResult.summary}</p>

                      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-cyan-300">Steps</p>
                      <div className="mt-1 space-y-2">
                        {agentResult.steps.map((step, idx) => (
                          <div key={`${step.command}-${idx}`} className="rounded border border-slate-700 bg-slate-950 p-2">
                            <p className="text-xs font-semibold text-slate-200">
                              {idx + 1}. <span className="font-mono">{step.command}</span>
                            </p>
                            {step.blocked && (
                              <p className="mt-1 text-xs text-amber-300">
                                Blocked: {step.blockedReason || "disallowed command"}
                              </p>
                            )}
                            {!step.blocked && (
                              <p className="mt-1 text-xs text-slate-400">
                                exit={String(step.exitCode)} • {step.durationMs}ms{step.timedOut ? " • timed out" : ""}
                              </p>
                            )}
                            {step.stdout && (
                              <pre className="mt-2 max-h-40 overflow-auto rounded border border-slate-800 bg-slate-900 p-2 text-[11px] text-slate-200">
                                {step.stdout}
                              </pre>
                            )}
                            {step.stderr && (
                              <pre className="mt-2 max-h-40 overflow-auto rounded border border-slate-800 bg-slate-900 p-2 text-[11px] text-rose-200">
                                {step.stderr}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>

                      {agentResult.warnings.length > 0 && (
                        <div className="mt-2 rounded border border-amber-600/40 bg-amber-500/10 p-2">
                          {agentResult.warnings.map((warning, idx) => (
                            <p key={`${warning}-${idx}`} className="text-xs text-amber-200">
                              {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

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
