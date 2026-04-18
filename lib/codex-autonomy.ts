import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import crypto from "node:crypto";
import { getCrmPool } from "@/lib/crm-db";

export type TargetArea = "coaching" | "crm" | "codex";
export type PolicyDecisionRoute = "direct_main" | "pr_required";
export type AutonomyStage =
  | "draft_plan"
  | "proposed_diff"
  | "awaiting_approval"
  | "approved_apply"
  | "verify"
  | "ship"
  | "completed"
  | "failed";

export type AutonomyRunStatus = "pending_approval" | "running" | "completed" | "failed";

export type ProposedOperation = {
  path: string;
  find: string;
  replace: string;
  replaceAll?: boolean;
};

export type ProposedDiffItem = {
  path: string;
  beforeSnippet: string;
  afterSnippet: string;
};

export type VerificationCheck = {
  name: string;
  command: string;
  exitCode: number | null;
  durationMs: number;
  passed: boolean;
  stdout: string;
  stderr: string;
};

export type VerificationResult = {
  passed: boolean;
  checks: VerificationCheck[];
};

export type ShipResult = {
  route: PolicyDecisionRoute;
  mode: "direct" | "pr";
  branch: string;
  commitSha: string;
  compareUrl?: string;
  prUrl?: string;
};

export type RevertResult = {
  branch: string;
  commitSha: string;
  compareUrl?: string;
  prUrl?: string;
};

export type AutonomyRun = {
  id: string;
  userId: string;
  task: string;
  targetArea: TargetArea;
  model: string;
  stage: AutonomyStage;
  status: AutonomyRunStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  failedAt?: string;
  completedAt?: string;
  policy: {
    route: PolicyDecisionRoute;
    reason: string;
    touchedPaths: string[];
  };
  plan: {
    reasoning: string;
    summary: string;
    operations: ProposedOperation[];
    warnings: string[];
  };
  proposedDiff: {
    items: ProposedDiffItem[];
  };
  verification?: VerificationResult;
  ship?: ShipResult;
  revert?: RevertResult;
  error?: string;
  timeline: Array<{
    stage: AutonomyStage;
    at: string;
    note?: string;
  }>;
};

type PlannerResponse = {
  reasoning: string;
  summary: string;
  operations: ProposedOperation[];
};

type FileStore = {
  runs: AutonomyRun[];
};

const dataRoot = process.env.VERCEL ? "/tmp" : process.cwd();
const dataDir = path.join(dataRoot, "data");
const dbPath = path.join(dataDir, "codex-autonomy.json");
const initialStore: FileStore = { runs: [] };

const AUTONOMY_DEFAULT_ALLOWED_PATHS = [
  "app/coaching",
  "app/coaching-v2",
  "app/crm",
  "app/api/crm",
  "lib/crm",
  "app/codex",
  "app/api/codex",
  "lib/codex",
];

const TARGET_AREA_PREFIXES: Record<TargetArea, string[]> = {
  coaching: ["app/coaching", "app/coaching-v2"],
  crm: ["app/crm", "app/api/crm", "lib/crm"],
  codex: ["app/codex", "app/api/codex", "lib/codex"],
};

const directMainAllowedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".md",
  ".mdx",
  ".json",
  ".txt",
]);

const MAX_OPERATIONS = 12;
const MAX_TASK_CHARS = 3000;
const MAX_SNIPPET_CHARS = 240;
const MAX_COMMAND_OUTPUT = 12000;
const MAX_CONCURRENT_DEFAULT = 1;

let schemaReady = false;
const runningApprovalsByUser = new Map<string, number>();

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return crypto.randomUUID();
}

function asText(v: unknown) {
  return String(v || "").trim();
}

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseJsonText(text: string): unknown {
  const raw = asText(text);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(raw.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeRepoPath(input: string) {
  const normalized = path.posix.normalize(String(input || "").replace(/\\/g, "/"));
  return normalized.replace(/^\/+/, "");
}

function allowedPathPrefixes() {
  const raw = asText(process.env.CODEX_ALLOWED_PATHS);
  if (!raw) return AUTONOMY_DEFAULT_ALLOWED_PATHS;
  return raw
    .split(",")
    .map((item) => normalizeRepoPath(item))
    .filter(Boolean);
}

function isWithinPrefixes(filePath: string, prefixes: string[]) {
  return prefixes.some((prefix) => filePath === prefix || filePath.startsWith(`${prefix}/`));
}

function validateTargetArea(area: unknown): TargetArea | null {
  const normalized = asText(area).toLowerCase();
  if (normalized === "coaching" || normalized === "crm" || normalized === "codex") {
    return normalized as TargetArea;
  }
  return null;
}

function sanitizeOperation(raw: unknown): ProposedOperation | null {
  const obj = asObject(raw);
  if (!obj) return null;
  const p = normalizeRepoPath(asText(obj.path));
  const find = String(obj.find || "");
  const replace = String(obj.replace || "");
  const replaceAll = Boolean(obj.replaceAll);
  if (!p || !find) return null;
  return { path: p, find, replace, replaceAll };
}

function classifyPolicy(targetArea: TargetArea, touchedPaths: string[]) {
  const safePaths = touchedPaths.map((p) => normalizeRepoPath(p)).filter(Boolean);
  const allWithinArea = safePaths.length > 0 && isWithinPrefixesArray(safePaths, TARGET_AREA_PREFIXES[targetArea]);
  if (!allWithinArea) {
    return {
      route: "pr_required" as const,
      reason: "One or more touched files are outside the selected area.",
    };
  }

  if (safePaths.some((p) => p.startsWith("app/crm/") || p === "app/crm" || p.startsWith("app/api/") || p.startsWith("lib/") || p === "proxy.ts")) {
    return {
      route: "pr_required" as const,
      reason: "CRM/backend/core paths require PR flow.",
    };
  }

  const directAllowedRoots = ["app/coaching", "app/coaching-v2", "app/codex"];
  const directEligible = safePaths.every((p) => {
    if (!isWithinPrefixes(p, directAllowedRoots)) return false;
    if (p.startsWith("app/codex/api/") || p.startsWith("app/coaching/api/")) return false;
    const ext = path.posix.extname(p);
    return directMainAllowedExtensions.has(ext);
  });

  if (directEligible) {
    return {
      route: "direct_main" as const,
      reason: "UI/content-only paths under coaching/codex are direct-main eligible.",
    };
  }

  return {
    route: "pr_required" as const,
    reason: "Changes include non-UI/content files and must go through PR flow.",
  };
}

function isWithinPrefixesArray(paths: string[], prefixes: string[]) {
  return paths.every((filePath) => isWithinPrefixes(filePath, prefixes));
}

function appendTimeline(run: AutonomyRun, stage: AutonomyStage, note?: string): AutonomyRun {
  const entry = { stage, at: nowIso(), note };
  return {
    ...run,
    stage,
    updatedAt: entry.at,
    timeline: [...run.timeline, entry],
  };
}

function readModel() {
  return asText(process.env.CODEX_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini");
}

function autonomyEnabled() {
  return process.env.CODEX_AUTONOMY_ENABLED !== "0";
}

function writeModeEnabled() {
  return asText(process.env.CODEX_WRITE_MODE || "on") !== "off";
}

function maxConcurrentPerUser() {
  const value = Number(process.env.CODEX_AUTONOMY_MAX_CONCURRENCY || MAX_CONCURRENT_DEFAULT);
  if (!Number.isFinite(value) || value <= 0) return MAX_CONCURRENT_DEFAULT;
  return Math.floor(value);
}

function beginApprovalSlot(userId: string) {
  const current = runningApprovalsByUser.get(userId) || 0;
  const max = maxConcurrentPerUser();
  if (current >= max) {
    throw new Error("MAX_CONCURRENT_RUNS_REACHED");
  }
  runningApprovalsByUser.set(userId, current + 1);
}

function endApprovalSlot(userId: string) {
  const current = runningApprovalsByUser.get(userId) || 0;
  if (current <= 1) {
    runningApprovalsByUser.delete(userId);
    return;
  }
  runningApprovalsByUser.set(userId, current - 1);
}

async function ensureSchema() {
  const pool = getCrmPool();
  if (!pool || schemaReady) return;
  await pool.query(`
    create table if not exists codex_autonomy_runs (
      id text primary key,
      user_id text not null,
      status text not null,
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists codex_autonomy_runs_user_updated_idx
      on codex_autonomy_runs(user_id, updated_at desc);
  `);
  schemaReady = true;
}

async function readFileStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    const parsed = JSON.parse(await readFile(dbPath, "utf8")) as FileStore;
    return {
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    } satisfies FileStore;
  } catch {
    await writeFile(dbPath, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
}

async function writeFileStore(store: FileStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(store, null, 2));
}

function mapRunRow(row: unknown): AutonomyRun {
  const obj = asObject(row) || {};
  const data = asObject(obj.data) || {};
  return data as unknown as AutonomyRun;
}

async function createRunStore(run: AutonomyRun) {
  const pool = getCrmPool();
  if (!pool) {
    const store = await readFileStore();
    store.runs.unshift(run);
    await writeFileStore(store);
    return run;
  }
  await ensureSchema();
  await pool.query(
    `insert into codex_autonomy_runs (id, user_id, status, data, created_at, updated_at)
     values ($1, $2, $3, $4::jsonb, now(), now())`,
    [run.id, run.userId, run.status, JSON.stringify(run)]
  );
  return run;
}

async function updateRunStore(run: AutonomyRun) {
  const pool = getCrmPool();
  if (!pool) {
    const store = await readFileStore();
    const idx = store.runs.findIndex((item) => item.id === run.id && item.userId === run.userId);
    if (idx < 0) throw new Error("RUN_NOT_FOUND");
    store.runs[idx] = run;
    await writeFileStore(store);
    return run;
  }
  await ensureSchema();
  const result = await pool.query(
    `update codex_autonomy_runs
     set status = $3, data = $4::jsonb, updated_at = now()
     where id = $1 and user_id = $2
     returning id`,
    [run.id, run.userId, run.status, JSON.stringify(run)]
  );
  if (!result.rowCount) throw new Error("RUN_NOT_FOUND");
  return run;
}

export async function getAutonomyRun(userId: string, runId: string) {
  const pool = getCrmPool();
  if (!pool) {
    const store = await readFileStore();
    return store.runs.find((run) => run.userId === userId && run.id === runId) || null;
  }
  await ensureSchema();
  const result = await pool.query(
    `select data from codex_autonomy_runs where id = $1 and user_id = $2 limit 1`,
    [runId, userId]
  );
  if (!result.rowCount) return null;
  return mapRunRow(result.rows[0]);
}

async function callModel(input: {
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
      model: input.model,
      temperature: 0.1,
      max_completion_tokens: input.maxCompletionTokens,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OPENAI_ERROR:${res.status}:${body.slice(0, 220)}`);
  }
  const payload = (await res.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = asText(payload.choices?.[0]?.message?.content);
  if (!text) throw new Error("EMPTY_MODEL_RESPONSE");
  return text;
}

async function planOperations(input: {
  task: string;
  targetArea: TargetArea;
  model: string;
}) {
  const system = [
    "You are a coding planner for deterministic file edits.",
    "Return ONLY valid JSON, no markdown or code fences.",
    "Schema:",
    "{",
    '  "reasoning": "string",',
    '  "summary": "string",',
    '  "operations": [',
    '    {"path":"relative/file/path","find":"exact text","replace":"new text","replaceAll":false}',
    "  ]",
    "}",
    "Rules:",
    "- Use exact find/replace operations only.",
    "- No shell commands.",
    `- Max ${MAX_OPERATIONS} operations.`,
  ].join("\n");
  const user = [
    `Target area: ${input.targetArea}`,
    `Task: ${input.task}`,
    "Allowed target area prefixes:",
    TARGET_AREA_PREFIXES[input.targetArea].join(", "),
  ].join("\n");
  const raw = await callModel({
    model: input.model,
    system,
    user,
    maxCompletionTokens: 1000,
  });
  const parsed = parseJsonText(raw);
  const obj = asObject(parsed);
  if (!obj) throw new Error("AUTONOMY_PLAN_PARSE_FAILED");
  const operationsRaw = Array.isArray(obj.operations) ? obj.operations : [];
  const operations = operationsRaw
    .map((item) => sanitizeOperation(item))
    .filter((item): item is ProposedOperation => Boolean(item))
    .slice(0, MAX_OPERATIONS);
  if (!operations.length) throw new Error("NO_VALID_OPERATIONS");
  return {
    reasoning: asText(obj.reasoning) || "Planned by model.",
    summary: asText(obj.summary) || "Proposed file updates are ready.",
    operations,
  } satisfies PlannerResponse;
}

function truncateSnippet(value: string) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_SNIPPET_CHARS) return normalized;
  return `${normalized.slice(0, MAX_SNIPPET_CHARS).trim()}...`;
}

async function buildProposedDiff(operations: ProposedOperation[]) {
  const warnings: string[] = [];
  const items: ProposedDiffItem[] = [];
  for (const operation of operations) {
    const fullPath = path.join(process.cwd(), operation.path);
    let content = "";
    try {
      content = await readFile(fullPath, "utf8");
    } catch {
      warnings.push(`${operation.path}: file not found or unreadable`);
      continue;
    }
    if (!content.includes(operation.find)) {
      warnings.push(`${operation.path}: find text was not found`);
      continue;
    }
    const replaced = operation.replaceAll
      ? content.split(operation.find).join(operation.replace)
      : content.replace(operation.find, operation.replace);
    if (replaced === content) {
      warnings.push(`${operation.path}: replacement produced no change`);
      continue;
    }
    items.push({
      path: operation.path,
      beforeSnippet: truncateSnippet(operation.find),
      afterSnippet: truncateSnippet(operation.replace),
    });
  }
  if (!items.length) {
    throw new Error("NO_APPLICABLE_OPERATIONS");
  }
  return { items, warnings };
}

function validateOperationScope(targetArea: TargetArea, operations: ProposedOperation[]) {
  const warnings: string[] = [];
  const globallyAllowed = allowedPathPrefixes();
  const areaAllowed = TARGET_AREA_PREFIXES[targetArea];
  for (const operation of operations) {
    const p = normalizeRepoPath(operation.path);
    if (!isWithinPrefixes(p, globallyAllowed)) {
      throw new Error(`DISALLOWED_PATH:${p}`);
    }
    if (!isWithinPrefixes(p, areaAllowed)) {
      throw new Error(`OUTSIDE_TARGET_AREA:${p}`);
    }
    if (p.includes("..")) {
      throw new Error(`INVALID_PATH:${p}`);
    }
    if (p.startsWith("/")) {
      throw new Error(`INVALID_PATH:${p}`);
    }
    if (!operation.find) {
      warnings.push(`${p}: empty find text`);
    }
  }
  return warnings;
}

function runShell(command: string, options?: { cwd?: string; timeoutMs?: number }) {
  const timeoutMs = options?.timeoutMs || 120000;
  const cwd = options?.cwd || process.cwd();
  return new Promise<{
    exitCode: number | null;
    durationMs: number;
    stdout: string;
    stderr: string;
    timedOut: boolean;
  }>((resolve) => {
    const started = Date.now();
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
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > MAX_COMMAND_OUTPUT) stdout = stdout.slice(-MAX_COMMAND_OUTPUT);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > MAX_COMMAND_OUTPUT) stderr = stderr.slice(-MAX_COMMAND_OUTPUT);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: typeof code === "number" ? code : null,
        durationMs: Date.now() - started,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        timedOut,
      });
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: null,
        durationMs: Date.now() - started,
        stdout: stdout.trim(),
        stderr: `${stderr}\n${String(error.message || error)}`.trim(),
        timedOut,
      });
    });
  });
}

function checkCommandsForPaths(paths: string[]) {
  const backendTouched = paths.some((p) => {
    return (
      p.startsWith("app/api/") ||
      p.startsWith("lib/") ||
      p.startsWith("app/crm/") ||
      p === "proxy.ts"
    );
  });

  if (backendTouched) {
    return [
      { name: "Typecheck", command: "npx tsc --noEmit", timeoutMs: 180000 },
      { name: "Build", command: "npm run build", timeoutMs: 420000 },
    ];
  }
  return [{ name: "Typecheck", command: "npx tsc --noEmit", timeoutMs: 180000 }];
}

async function runVerification(paths: string[]): Promise<VerificationResult> {
  const checks: VerificationCheck[] = [];
  for (const check of checkCommandsForPaths(paths)) {
    const result = await runShell(check.command, { timeoutMs: check.timeoutMs });
    checks.push({
      name: check.name,
      command: check.command,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      passed: result.exitCode === 0 && !result.timedOut,
      stdout: result.stdout,
      stderr: result.stderr,
    });
    if (!checks[checks.length - 1].passed) {
      return {
        passed: false,
        checks,
      };
    }
  }
  return {
    passed: true,
    checks,
  };
}

async function ensureCleanWorktree() {
  const status = await runShell("git status --porcelain");
  if (status.exitCode !== 0) throw new Error("GIT_STATUS_FAILED");
  if (asText(status.stdout)) {
    throw new Error("DIRTY_WORKTREE");
  }
}

function remoteToHttps(remote: string) {
  const value = asText(remote);
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/\.git$/, "");
  }
  const ssh = value.match(/^git@github\.com:(.+)$/);
  if (ssh) {
    return `https://github.com/${ssh[1].replace(/\.git$/, "")}`;
  }
  return "";
}

async function shipRunChanges(run: AutonomyRun, changedFiles: string[]): Promise<ShipResult> {
  const originalBranchRes = await runShell("git rev-parse --abbrev-ref HEAD");
  if (originalBranchRes.exitCode !== 0) throw new Error("GIT_BRANCH_READ_FAILED");
  const originalBranch = asText(originalBranchRes.stdout);
  const remoteRes = await runShell("git config --get remote.origin.url");
  const remoteHttps = remoteToHttps(remoteRes.stdout);

  if (run.policy.route === "direct_main") {
    if (originalBranch !== "main") {
      const checkoutMain = await runShell("git checkout main");
      if (checkoutMain.exitCode !== 0) throw new Error("GIT_CHECKOUT_MAIN_FAILED");
    }
    const addRes = await runShell(`git add ${changedFiles.map((item) => `'${item}'`).join(" ")}`);
    if (addRes.exitCode !== 0) throw new Error("GIT_ADD_FAILED");
    const commitMessage = `codex: ${run.task.slice(0, 72)} [run:${run.id.slice(0, 8)}]`;
    const commitRes = await runShell(`git commit -m "${commitMessage.replace(/"/g, "'")}"`);
    if (commitRes.exitCode !== 0) throw new Error("GIT_COMMIT_FAILED");
    const shaRes = await runShell("git rev-parse HEAD");
    if (shaRes.exitCode !== 0) throw new Error("GIT_SHA_FAILED");
    const pushRes = await runShell("git push origin main");
    if (pushRes.exitCode !== 0) throw new Error("GIT_PUSH_FAILED");

    if (originalBranch && originalBranch !== "main") {
      await runShell(`git checkout ${originalBranch}`);
    }

    return {
      route: run.policy.route,
      mode: "direct",
      branch: "main",
      commitSha: asText(shaRes.stdout),
    };
  }

  const branch = `codex/run-${run.id.slice(0, 8)}`;
  const checkoutBranch = await runShell(`git checkout -b ${branch}`);
  if (checkoutBranch.exitCode !== 0) throw new Error("GIT_BRANCH_CREATE_FAILED");
  const addRes = await runShell(`git add ${changedFiles.map((item) => `'${item}'`).join(" ")}`);
  if (addRes.exitCode !== 0) throw new Error("GIT_ADD_FAILED");
  const commitMessage = `codex: ${run.task.slice(0, 72)} [run:${run.id.slice(0, 8)}]`;
  const commitRes = await runShell(`git commit -m "${commitMessage.replace(/"/g, "'")}"`);
  if (commitRes.exitCode !== 0) throw new Error("GIT_COMMIT_FAILED");
  const shaRes = await runShell("git rev-parse HEAD");
  if (shaRes.exitCode !== 0) throw new Error("GIT_SHA_FAILED");
  const pushRes = await runShell(`git push -u origin ${branch}`);
  if (pushRes.exitCode !== 0) throw new Error("GIT_PUSH_FAILED");

  if (originalBranch) {
    await runShell(`git checkout ${originalBranch}`);
  }

  const compareUrl = remoteHttps ? `${remoteHttps}/compare/main...${branch}` : undefined;
  return {
    route: run.policy.route,
    mode: "pr",
    branch,
    commitSha: asText(shaRes.stdout),
    compareUrl,
    prUrl: compareUrl ? `${compareUrl}?expand=1` : undefined,
  };
}

async function applyOperations(operations: ProposedOperation[]) {
  const backups = new Map<string, string>();
  const changedFiles = new Set<string>();
  for (const operation of operations) {
    const fullPath = path.join(process.cwd(), operation.path);
    const original = await readFile(fullPath, "utf8");
    backups.set(operation.path, original);
    if (!original.includes(operation.find)) {
      throw new Error(`FIND_TEXT_MISSING:${operation.path}`);
    }
    const next = operation.replaceAll
      ? original.split(operation.find).join(operation.replace)
      : original.replace(operation.find, operation.replace);
    if (next === original) continue;
    await writeFile(fullPath, next);
    changedFiles.add(operation.path);
  }
  if (!changedFiles.size) {
    throw new Error("NO_CHANGED_FILES_AFTER_APPLY");
  }
  return {
    backups,
    changedFiles: Array.from(changedFiles),
  };
}

async function restoreBackups(backups: Map<string, string>) {
  for (const [filePath, content] of backups.entries()) {
    const fullPath = path.join(process.cwd(), filePath);
    await writeFile(fullPath, content);
  }
}

export async function createAutonomyRun(input: {
  userId: string;
  task: string;
  targetArea: TargetArea;
  model?: string;
}) {
  if (!autonomyEnabled()) throw new Error("AUTONOMY_DISABLED");
  const task = asText(input.task);
  if (!task) throw new Error("TASK_REQUIRED");
  if (task.length > MAX_TASK_CHARS) throw new Error("TASK_TOO_LARGE");

  const targetArea = validateTargetArea(input.targetArea);
  if (!targetArea) throw new Error("TARGET_AREA_INVALID");
  const model = asText(input.model || readModel());

  const planned = await planOperations({
    task,
    targetArea,
    model,
  });

  const scopeWarnings = validateOperationScope(targetArea, planned.operations);
  const touchedPaths = planned.operations.map((item) => normalizeRepoPath(item.path));
  const policy = classifyPolicy(targetArea, touchedPaths);
  const diff = await buildProposedDiff(planned.operations);

  const createdAt = nowIso();
  let run: AutonomyRun = {
    id: makeId(),
    userId: input.userId,
    task,
    targetArea,
    model,
    stage: "draft_plan",
    status: "pending_approval",
    createdAt,
    updatedAt: createdAt,
    policy: {
      route: policy.route,
      reason: policy.reason,
      touchedPaths,
    },
    plan: {
      reasoning: planned.reasoning,
      summary: planned.summary,
      operations: planned.operations,
      warnings: [...scopeWarnings, ...diff.warnings],
    },
    proposedDiff: {
      items: diff.items,
    },
    timeline: [{ stage: "draft_plan", at: createdAt, note: "Draft plan generated." }],
  };
  run = appendTimeline(run, "proposed_diff", "Proposed diff generated.");
  run = appendTimeline(run, "awaiting_approval", "Ready for approval.");
  await createRunStore(run);
  return run;
}

export async function approveAutonomyRun(input: {
  userId: string;
  runId: string;
}) {
  if (!autonomyEnabled()) throw new Error("AUTONOMY_DISABLED");
  if (!writeModeEnabled()) throw new Error("WRITE_MODE_OFF");
  beginApprovalSlot(input.userId);
  try {
    const existing = await getAutonomyRun(input.userId, input.runId);
    if (!existing) throw new Error("RUN_NOT_FOUND");
    if (existing.status !== "pending_approval" || existing.stage !== "awaiting_approval") {
      throw new Error("RUN_NOT_APPROVABLE");
    }
    await ensureCleanWorktree();

    let run: AutonomyRun = {
      ...existing,
      status: "running",
      approvedAt: nowIso(),
    };
    run = appendTimeline(run, "approved_apply", "Approval received.");
    await updateRunStore(run);

    const { backups, changedFiles } = await applyOperations(run.plan.operations);
    let needsRestore = true;
    try {
      run = appendTimeline(run, "verify", "Running verification checks.");
      await updateRunStore(run);

      const verification = await runVerification(changedFiles);
      run = {
        ...run,
        verification,
      };
      await updateRunStore(run);
      if (!verification.passed) {
        run = appendTimeline(run, "failed", "Verification failed.");
        run = {
          ...run,
          status: "failed",
          failedAt: nowIso(),
          error: "VERIFICATION_FAILED",
        };
        await updateRunStore(run);
        await restoreBackups(backups);
        needsRestore = false;
        return run;
      }

      run = appendTimeline(run, "ship", "Shipping changes.");
      await updateRunStore(run);
      const ship = await shipRunChanges(run, changedFiles);
      needsRestore = false;

      run = appendTimeline(run, "completed", "Run completed successfully.");
      run = {
        ...run,
        status: "completed",
        stage: "completed",
        completedAt: nowIso(),
        ship,
      };
      await updateRunStore(run);
      return run;
    } catch (error) {
      if (needsRestore) {
        await restoreBackups(backups).catch(() => {});
      }
      run = appendTimeline(run, "failed", "Run failed during apply/verify/ship.");
      run = {
        ...run,
        status: "failed",
        stage: "failed",
        failedAt: nowIso(),
        error: String((error as Error)?.message || "RUN_FAILED"),
      };
      await updateRunStore(run);
      return run;
    }
  } finally {
    endApprovalSlot(input.userId);
  }
}

export async function revertAutonomyRun(input: {
  userId: string;
  runId: string;
}) {
  if (!autonomyEnabled()) throw new Error("AUTONOMY_DISABLED");
  if (!writeModeEnabled()) throw new Error("WRITE_MODE_OFF");
  const existing = await getAutonomyRun(input.userId, input.runId);
  if (!existing) throw new Error("RUN_NOT_FOUND");
  if (existing.status !== "completed" || !existing.ship?.commitSha) {
    throw new Error("RUN_NOT_REVERTABLE");
  }
  await ensureCleanWorktree();

  const originalBranchRes = await runShell("git rev-parse --abbrev-ref HEAD");
  if (originalBranchRes.exitCode !== 0) throw new Error("GIT_BRANCH_READ_FAILED");
  const originalBranch = asText(originalBranchRes.stdout);
  if (originalBranch !== "main") {
    const checkoutMain = await runShell("git checkout main");
    if (checkoutMain.exitCode !== 0) throw new Error("GIT_CHECKOUT_MAIN_FAILED");
  }
  const revertBranch = `revert/run-${existing.id.slice(0, 8)}`;
  const createBranch = await runShell(`git checkout -b ${revertBranch}`);
  if (createBranch.exitCode !== 0) throw new Error("REVERT_BRANCH_CREATE_FAILED");
  const revert = await runShell(`git revert --no-edit ${existing.ship.commitSha}`);
  if (revert.exitCode !== 0) {
    await runShell(`git checkout ${originalBranch || "main"}`).catch(() => {});
    throw new Error("GIT_REVERT_FAILED");
  }
  const shaRes = await runShell("git rev-parse HEAD");
  if (shaRes.exitCode !== 0) throw new Error("GIT_SHA_FAILED");
  const pushRes = await runShell(`git push -u origin ${revertBranch}`);
  if (pushRes.exitCode !== 0) throw new Error("GIT_PUSH_FAILED");

  const remoteRes = await runShell("git config --get remote.origin.url");
  const remoteHttps = remoteToHttps(remoteRes.stdout);
  const compareUrl = remoteHttps ? `${remoteHttps}/compare/main...${revertBranch}` : undefined;

  if (originalBranch && originalBranch !== revertBranch) {
    await runShell(`git checkout ${originalBranch}`).catch(() => {});
  }

  const revertResult: RevertResult = {
    branch: revertBranch,
    commitSha: asText(shaRes.stdout),
    compareUrl,
    prUrl: compareUrl ? `${compareUrl}?expand=1` : undefined,
  };
  const updated: AutonomyRun = {
    ...existing,
    revert: revertResult,
    updatedAt: nowIso(),
  };
  await updateRunStore(updated);
  return updated;
}
