import { spawn } from "node:child_process";
import path from "node:path";

const ALLOWED_ROOT_COMMANDS = new Set([
  "pwd",
  "ls",
  "rg",
  "cat",
  "sed",
  "head",
  "tail",
  "wc",
  "find",
  "git",
  "npm",
  "node",
  "npx",
  "pnpm",
  "tsc",
]);

const ALLOWED_GIT_SUBCOMMANDS = new Set([
  "status",
  "diff",
  "show",
  "log",
  "branch",
  "rev-parse",
]);

const ALLOWED_NPM_SUBCOMMANDS = new Set([
  "test",
  "run",
  "lint",
  "build",
]);

const MAX_COMMANDS = 5;
const MAX_OUTPUT_CHARS = 12000;
const MAX_COMMAND_CHARS = 180;
const COMMAND_TIMEOUT_MS = 20000;

export type AgentRepo = {
  alias: string;
  path: string;
};

export type AgentStep = {
  command: string;
  blocked: boolean;
  blockedReason?: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
};

export type AgentRunResult = {
  mode: "local";
  repo: AgentRepo;
  planReasoning: string;
  commands: string[];
  steps: AgentStep[];
  summary: string;
  warnings: string[];
};

type PlannerResponse = {
  reasoning: string;
  commands: string[];
};

function asText(v: unknown) {
  return String(v || "").trim();
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function availableRepos(): AgentRepo[] {
  const raw = asText(process.env.CODEX_AGENT_REPOS);
  if (!raw) {
    return [{ alias: "workspace", path: process.cwd() }];
  }
  const parsed = parseJson(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return [{ alias: "workspace", path: process.cwd() }];
  }
  const entries: AgentRepo[] = [];
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    const alias = asText(key);
    const repoPath = asText(value);
    if (!alias || !repoPath) continue;
    entries.push({ alias, path: repoPath });
  }
  return entries.length ? entries : [{ alias: "workspace", path: process.cwd() }];
}

function tokenizeCommand(command: string) {
  return command.split(/\s+/g).map((token) => token.trim()).filter(Boolean);
}

function hasDisallowedCharacters(command: string) {
  return /[;&|><`$()]/.test(command);
}

function hasUnsafePathArg(tokens: string[]) {
  for (const token of tokens.slice(1)) {
    if (!token) continue;
    if (token.startsWith("-")) continue;
    if (token.startsWith("/")) return true;
    if (token.startsWith("~")) return true;
    if (token.includes("..")) return true;
    if (token.includes("://")) return true;
  }
  return false;
}

function validateCommand(command: string): { ok: boolean; reason?: string } {
  const normalized = asText(command);
  if (!normalized) return { ok: false, reason: "Empty command" };
  if (normalized.length > MAX_COMMAND_CHARS) return { ok: false, reason: "Command too long" };
  if (hasDisallowedCharacters(normalized)) return { ok: false, reason: "Contains disallowed shell operators" };
  const tokens = tokenizeCommand(normalized);
  if (!tokens.length) return { ok: false, reason: "No command token found" };
  const root = tokens[0];
  if (!ALLOWED_ROOT_COMMANDS.has(root)) {
    return { ok: false, reason: `Command '${root}' is not allowed` };
  }
  if (hasUnsafePathArg(tokens)) {
    return { ok: false, reason: "Unsafe path or URL argument detected" };
  }
  if (root === "git") {
    const sub = tokens[1] || "";
    if (!ALLOWED_GIT_SUBCOMMANDS.has(sub)) {
      return { ok: false, reason: `git ${sub || "(missing)"} is not allowed` };
    }
  }
  if (root === "npm") {
    const sub = tokens[1] || "";
    if (!ALLOWED_NPM_SUBCOMMANDS.has(sub)) {
      return { ok: false, reason: `npm ${sub || "(missing)"} is not allowed` };
    }
  }
  return { ok: true };
}

async function runCommand(command: string, cwd: string): Promise<AgentStep> {
  const validation = validateCommand(command);
  if (!validation.ok) {
    return {
      command,
      blocked: true,
      blockedReason: validation.reason,
      exitCode: null,
      timedOut: false,
      durationMs: 0,
      stdout: "",
      stderr: "",
    };
  }

  const started = Date.now();
  return new Promise<AgentStep>((resolve) => {
    const child = spawn("/bin/bash", ["-lc", command], {
      cwd,
      env: {
        ...process.env,
        PATH: process.env.PATH || "",
        HOME: process.env.HOME || "",
        LANG: process.env.LANG || "en_US.UTF-8",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, COMMAND_TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > MAX_OUTPUT_CHARS) {
        stdout = stdout.slice(-MAX_OUTPUT_CHARS);
      }
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > MAX_OUTPUT_CHARS) {
        stderr = stderr.slice(-MAX_OUTPUT_CHARS);
      }
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        command,
        blocked: false,
        exitCode: typeof code === "number" ? code : null,
        timedOut,
        durationMs: Date.now() - started,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        command,
        blocked: false,
        exitCode: null,
        timedOut,
        durationMs: Date.now() - started,
        stdout: stdout.trim(),
        stderr: `${stderr}\n${String(error.message || error)}`.trim(),
      });
    });
  });
}

async function callModel(payload: {
  model: string;
  system: string;
  user: string;
  maxCompletionTokens: number;
}) {
  const apiKey = asText(process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY);
  if (!apiKey) throw new Error("OPENAI_KEY_MISSING");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: payload.model,
      temperature: 0.1,
      max_completion_tokens: payload.maxCompletionTokens,
      messages: [
        { role: "system", content: payload.system },
        { role: "user", content: payload.user },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OPENAI_ERROR:${res.status}:${text.slice(0, 200)}`);
  }
  const parsed = (await res.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = asText(parsed.choices?.[0]?.message?.content);
  if (!content) throw new Error("EMPTY_MODEL_RESPONSE");
  return content;
}

async function planCommands(input: {
  task: string;
  repo: AgentRepo;
  model: string;
}): Promise<PlannerResponse> {
  const system = [
    "You are a secure coding assistant planner.",
    "Return ONLY strict JSON with shape:",
    "{\"reasoning\":\"string\",\"commands\":[\"cmd1\",\"cmd2\"]}",
    `Max ${MAX_COMMANDS} commands.`,
    "Use only read-focused and verification commands.",
  ].join("\n");
  const user = [
    `Task: ${input.task}`,
    `Repo alias: ${input.repo.alias}`,
    `Repo path: ${input.repo.path}`,
    "Allowed root commands: pwd, ls, rg, cat, sed, head, tail, wc, find, git, npm, node, npx, pnpm, tsc",
    "Allowed git subcommands: status, diff, show, log, branch, rev-parse",
    "Allowed npm subcommands: test, run, lint, build",
    "No shell pipes/operators.",
  ].join("\n");

  const raw = await callModel({
    model: input.model,
    system,
    user,
    maxCompletionTokens: 500,
  });

  const parsed = parseJson(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { reasoning: "Fallback plan used: planner output was not valid JSON.", commands: ["pwd", "ls"] };
  }

  const obj = parsed as Record<string, unknown>;
  const reasoning = asText(obj.reasoning) || "Planned by model.";
  const commandsRaw = Array.isArray(obj.commands) ? obj.commands : [];
  const commands = commandsRaw
    .map((item) => asText(item))
    .filter(Boolean)
    .slice(0, MAX_COMMANDS);

  if (!commands.length) {
    return { reasoning: `${reasoning} Fallback plan used: empty commands.`, commands: ["pwd", "ls"] };
  }
  return { reasoning, commands };
}

async function summarizeRun(input: {
  task: string;
  model: string;
  steps: AgentStep[];
}) {
  const compactSteps = input.steps.map((step, index) => ({
    step: index + 1,
    command: step.command,
    blocked: step.blocked,
    exitCode: step.exitCode,
    timedOut: step.timedOut,
    stdout: step.stdout.slice(0, 800),
    stderr: step.stderr.slice(0, 800),
  }));

  const system = [
    "You are a concise engineering run summarizer.",
    "Summarize what happened, key findings, and next action.",
    "Keep it under 120 words.",
  ].join("\n");
  const user = JSON.stringify(
    {
      task: input.task,
      steps: compactSteps,
    },
    null,
    2
  );

  return callModel({
    model: input.model,
    system,
    user,
    maxCompletionTokens: 260,
  });
}

export function codexAgentConfig() {
  const repos = availableRepos();
  return {
    enabled: true,
    repos,
    mode: "local" as const,
  };
}

export async function runCodexAgentTask(input: {
  task: string;
  repoAlias?: string;
  model?: string;
}) {
  const task = asText(input.task);
  if (!task) throw new Error("TASK_REQUIRED");
  if (task.length > 3000) throw new Error("TASK_TOO_LARGE");

  const { repos } = codexAgentConfig();
  const requested = asText(input.repoAlias);
  const repo = repos.find((item) => item.alias === requested) || repos[0];
  if (!repo) throw new Error("REPO_NOT_AVAILABLE");

  const rootCwd = path.resolve(repo.path);
  const model = asText(input.model || process.env.CODEX_AGENT_MODEL || process.env.CODEX_MODEL || "gpt-5.4");
  const plan = await planCommands({
    task,
    repo,
    model,
  });

  const warnings: string[] = [];
  const commands = plan.commands.slice(0, MAX_COMMANDS);
  const steps: AgentStep[] = [];
  for (const command of commands) {
    const step = await runCommand(command, rootCwd);
    if (step.blocked && step.blockedReason) {
      warnings.push(`${command}: ${step.blockedReason}`);
    }
    steps.push(step);
  }

  const summary = await summarizeRun({
    task,
    model,
    steps,
  }).catch((error) => {
    const message = String((error as Error)?.message || "");
    warnings.push(`Summary generation failed: ${message || "unknown error"}`);
    return "Run completed. Summary was unavailable.";
  });

  return {
    mode: "local" as const,
    repo,
    planReasoning: plan.reasoning,
    commands,
    steps,
    summary,
    warnings,
  } satisfies AgentRunResult;
}
