import { access, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { constants as fsConstants } from "node:fs";
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

export type AutonomyExecutionResult = {
  status: "completed" | "failed";
  verification?: VerificationResult;
  ship?: ShipResult;
  error?: string;
};

export type AutonomyRevertExecutionResult = {
  status: "completed" | "failed";
  revert?: RevertResult;
  error?: string;
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
const HEURISTIC_MAX_SCAN_FILES = 500;
const CONTEXT_REPLAN_MAX_FILES = 8;
const CONTEXT_REPLAN_SNIPPET_CHARS = 1200;
const AUTONOMY_SYNTAX_CHECK_COMMAND = "__autonomy_syntax_check__";
const HEURISTIC_ALLOWED_EXTENSIONS = new Set([
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

let schemaReady = false;
const runningApprovalsByUser = new Map<string, number>();
let workspaceRootPromise: Promise<string> | null = null;
let gitRootPromise: Promise<string> | null = null;
const DEFAULT_PATH_FALLBACK = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";

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

async function pathExists(target: string) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.map((item) => String(item || "").trim()).filter(Boolean)));
}

async function hasWorkspaceMarkers(root: string) {
  const packageJson = path.join(root, "package.json");
  const appDir = path.join(root, "app");
  return (await pathExists(packageJson)) && (await pathExists(appDir));
}

async function hasGitMarkers(root: string) {
  const gitDir = path.join(root, ".git");
  return pathExists(gitDir);
}

function candidateWorkspaceRoots() {
  const cwd = process.cwd();
  const parent = path.dirname(cwd);
  const grandparent = path.dirname(parent);
  return dedupeStrings([
    asText(process.env.CODEX_REPO_ROOT),
    asText(process.env.CODEX_WORKSPACE_ROOT),
    cwd,
    parent,
    grandparent,
    path.join(cwd, "bos360-site"),
    path.join(parent, "bos360-site"),
    path.join(grandparent, "bos360-site"),
  ]);
}

async function resolveWorkspaceRoot() {
  if (!workspaceRootPromise) {
    workspaceRootPromise = (async () => {
      const candidates = candidateWorkspaceRoots();
      for (const candidate of candidates) {
        if (await hasGitMarkers(candidate)) return candidate;
      }
      for (const candidate of candidates) {
        if (await hasWorkspaceMarkers(candidate)) return candidate;
      }
      return process.cwd();
    })();
  }
  return workspaceRootPromise;
}

async function resolveGitRoot() {
  if (!gitRootPromise) {
    gitRootPromise = (async () => {
      const workspaceRoot = await resolveWorkspaceRoot();
      const probe = await runShell("git rev-parse --show-toplevel", {
        cwd: workspaceRoot,
        timeoutMs: 15000,
      });
      if (probe.exitCode === 0) {
        const root = asText(probe.stdout);
        if (root) return root;
      }
      const detail = asText(probe.stderr || probe.stdout);
      throw new Error(detail ? `GIT_REPO_NOT_FOUND:${detail.slice(0, 240)}` : "GIT_REPO_NOT_FOUND");
    })();
  }
  return gitRootPromise;
}

function allowedPathPrefixes() {
  const raw = asText(process.env.CODEX_ALLOWED_PATHS);
  if (!raw) return AUTONOMY_DEFAULT_ALLOWED_PATHS;
  return raw
    .split(",")
    .map((item) => normalizeRepoPath(item))
    .filter(Boolean);
}

function repositoryHintsForTargetArea(targetArea: TargetArea) {
  if (targetArea === "coaching") {
    return [
      "/coaching is a redirect wrapper at app/coaching/page.js.",
      "Real coaching page content is in app/coaching-v2/page.js (also used by /bos360).",
      "Prefer editing app/coaching-v2/page.js for coaching hero/content changes.",
    ];
  }
  return [];
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

async function collectCandidateFiles(prefixes: string[], workspaceRoot: string) {
  const found: string[] = [];

  async function walk(relativeDir: string) {
    if (found.length >= HEURISTIC_MAX_SCAN_FILES) return;
    const absoluteDir = path.join(workspaceRoot, relativeDir);
    let entries: import("node:fs").Dirent[] = [];
    try {
      entries = await readdir(absoluteDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (found.length >= HEURISTIC_MAX_SCAN_FILES) return;
      const childRelative = normalizeRepoPath(path.posix.join(relativeDir, entry.name));
      if (entry.isDirectory()) {
        await walk(childRelative);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.posix.extname(childRelative);
      if (!HEURISTIC_ALLOWED_EXTENSIONS.has(ext)) continue;
      found.push(childRelative);
    }
  }

  for (const prefix of prefixes) {
    await walk(normalizeRepoPath(prefix));
    if (found.length >= HEURISTIC_MAX_SCAN_FILES) break;
  }
  return found;
}

function taskKeywords(task: string) {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "into",
    "that",
    "this",
    "then",
    "run",
    "ship",
    "per",
    "policy",
    "hero",
    "page",
    "update",
  ]);
  return Array.from(
    new Set(
      String(task || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3 && !stopWords.has(token))
    )
  );
}

function extractSnippetAround(content: string, matchIndex: number) {
  if (!content) return "";
  if (matchIndex < 0) {
    return content.slice(0, CONTEXT_REPLAN_SNIPPET_CHARS);
  }
  const halfWindow = Math.floor(CONTEXT_REPLAN_SNIPPET_CHARS / 2);
  const start = Math.max(0, matchIndex - halfWindow);
  const end = Math.min(content.length, start + CONTEXT_REPLAN_SNIPPET_CHARS);
  return content.slice(start, end);
}

async function buildContextSnippets(task: string, targetArea: TargetArea, workspaceRoot: string) {
  const keywords = taskKeywords(task);
  const files = await collectCandidateFiles(TARGET_AREA_PREFIXES[targetArea], workspaceRoot);
  const scored: Array<{ path: string; score: number; snippet: string }> = [];

  for (const filePath of files) {
    const fullPath = path.join(workspaceRoot, filePath);
    let content = "";
    try {
      content = await readFile(fullPath, "utf8");
    } catch {
      continue;
    }
    if (!content.trim()) continue;
    const lowerPath = filePath.toLowerCase();
    const lower = content.toLowerCase();
    let pathHits = 0;
    let contentHits = 0;
    let firstMatch = -1;
    for (const keyword of keywords) {
      if (lowerPath.includes(keyword)) pathHits += 1;
      const idx = lower.indexOf(keyword);
      if (idx >= 0) {
        contentHits += 1;
        if (firstMatch < 0 || idx < firstMatch) firstMatch = idx;
      }
    }
    const score = contentHits * 4 + pathHits;
    if (score <= 0 && keywords.length > 0) continue;
    const snippet = extractSnippetAround(content, firstMatch);
    scored.push({
      path: filePath,
      score,
      snippet,
    });
  }

  const fallbackPaths = targetArea === "coaching" ? ["app/coaching-v2/page.js"] : [];
  for (const fallbackPath of fallbackPaths) {
    if (scored.some((item) => item.path === fallbackPath)) continue;
    try {
      const content = await readFile(path.join(workspaceRoot, fallbackPath), "utf8");
      scored.push({
        path: fallbackPath,
        score: 1,
        snippet: extractSnippetAround(content, -1),
      });
    } catch {
      // ignore
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, CONTEXT_REPLAN_MAX_FILES)
    .map((item) => ({ path: item.path, snippet: item.snippet }));
}

function findQuotedReplacePair(task: string) {
  const match = task.match(/from\s+[\"'“”‘’]([\s\S]+?)[\"'“”‘’]\s+to\s+[\"'“”‘’]([\s\S]+?)[\"'“”‘’]/i);
  if (!match) return null;
  const fromText = String(match[1] || "").trim();
  const toText = String(match[2] || "").trim();
  if (!fromText || !toText) return null;
  return { fromText, toText };
}

function firstQuotedText(task: string) {
  const match = String(task || "").match(/[\"'“”‘’]([^\"'“”‘’]{1,180})[\"'“”‘’]/);
  return match ? String(match[1] || "").trim() : "";
}

function escapeJsxText(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textVariants(value: string) {
  const v = String(value || "");
  const variants = new Set<string>([
    v,
    v.replace(/'/g, "’"),
    v.replace(/’/g, "'"),
    v.replace(/"/g, "“"),
    v.replace(/"/g, "”"),
    v.replace(/–/g, "-"),
    v.replace(/—/g, "-"),
    v.replace(/-/g, "–"),
  ]);
  return Array.from(variants).filter(Boolean);
}

async function deriveHeuristicOperations(task: string, targetArea: TargetArea, workspaceRoot: string) {
  const pair = findQuotedReplacePair(task);
  if (!pair) return [] as ProposedOperation[];
  const files = await collectCandidateFiles(TARGET_AREA_PREFIXES[targetArea], workspaceRoot);
  const fromVariants = textVariants(pair.fromText);
  const toVariants = textVariants(pair.toText);
  for (const filePath of files) {
    const fullPath = path.join(workspaceRoot, filePath);
    let content = "";
    try {
      content = await readFile(fullPath, "utf8");
    } catch {
      continue;
    }
    const matchedFrom = fromVariants.find((variant) => content.includes(variant));
    if (!matchedFrom) continue;
    const matchedTo = toVariants.find((variant) => variant.length > 0) || pair.toText;
    return [
      {
        path: filePath,
        find: matchedFrom,
        replace: matchedTo,
        replaceAll: false,
      },
    ];
  }
  return [] as ProposedOperation[];
}

async function deriveIntentAwareOperations(task: string, targetArea: TargetArea, workspaceRoot: string) {
  const lowerTask = String(task || "").toLowerCase();
  const wantsAdd = lowerTask.includes("add");
  const mentionsFooter = lowerTask.includes("footer");
  const quoted = firstQuotedText(task);
  if (!wantsAdd || !mentionsFooter || !quoted) return [] as ProposedOperation[];

  const escapedText = escapeJsxText(quoted);
  const candidatePaths =
    targetArea === "coaching"
      ? ["app/coaching-v2/page.js", "app/coaching/page.js"]
      : targetArea === "codex"
      ? ["app/codex/page.js"]
      : [];

  for (const filePath of candidatePaths) {
    const fullPath = path.join(workspaceRoot, filePath);
    let content = "";
    try {
      content = await readFile(fullPath, "utf8");
    } catch {
      continue;
    }
    const closeIdx = content.lastIndexOf("</footer>");
    if (closeIdx < 0) continue;
    const openIdx = content.lastIndexOf("<footer", closeIdx);
    if (openIdx >= 0) {
      const footerBlock = content.slice(openIdx, closeIdx);
      if (footerBlock.includes(quoted) || footerBlock.includes(escapedText)) {
        return [] as ProposedOperation[];
      }
    }

    const closeLineStart = content.lastIndexOf("\n", closeIdx) + 1;
    if (closeLineStart < 0) continue;
    const closeLineEnd = content.indexOf("\n", closeIdx);
    if (closeLineEnd < 0) continue;
    const nextLineEnd = content.indexOf("\n", closeLineEnd + 1);
    if (nextLineEnd < 0) continue;
    const closeLine = content.slice(closeLineStart, closeLineEnd);
    const indentMatch = closeLine.match(/^(\s*)<\/footer>\s*$/);
    if (!indentMatch) continue;
    const innerIndent = `${indentMatch[1]}  `;
    const anchor = content.slice(closeLineStart, nextLineEnd);

    return [
      {
        path: filePath,
        find: anchor,
        replace: `${innerIndent}<div>${escapedText}</div>\n${anchor}`,
        replaceAll: false,
      },
    ];
  }

  return [] as ProposedOperation[];
}

async function planOperationsWithRepoContext(input: {
  task: string;
  targetArea: TargetArea;
  model: string;
  workspaceRoot: string;
}) {
  const contextFiles = await buildContextSnippets(input.task, input.targetArea, input.workspaceRoot);
  if (!contextFiles.length) throw new Error("AUTONOMY_CONTEXT_EMPTY");
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
    "- Path must be one of the provided files.",
    "- find MUST be copied verbatim from provided snippets so the replace can apply.",
    "- No shell commands.",
    `- Max ${MAX_OPERATIONS} operations.`,
  ].join("\n");
  const notes = repositoryHintsForTargetArea(input.targetArea);
  const user = [
    `Target area: ${input.targetArea}`,
    `Task: ${input.task}`,
    "Provided file excerpts:",
    ...contextFiles.map(
      (item) =>
        `FILE: ${item.path}\n-----\n${item.snippet}\n-----`
    ),
    notes.length ? `Repository notes:\n${notes.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const raw = await callModel({
    model: input.model,
    system,
    user,
    maxCompletionTokens: 1500,
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
    reasoning: asText(obj.reasoning) || "Planned by model (context re-plan).",
    summary: asText(obj.summary) || "Proposed file updates are ready.",
    operations,
  } satisfies PlannerResponse;
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
  return asText(process.env.CODEX_MODEL || process.env.OPENAI_MODEL || "gpt-5.4");
}

function autonomyEnabled() {
  return process.env.CODEX_AUTONOMY_ENABLED !== "0";
}

function writeModeEnabled() {
  return asText(process.env.CODEX_WRITE_MODE || "on") !== "off";
}

function remoteExecutorUrl() {
  return asText(process.env.CODEX_AUTONOMY_EXECUTOR_URL);
}

function remoteExecutorSecret() {
  return asText(process.env.CODEX_AUTONOMY_EXECUTOR_SECRET);
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

async function executeAutonomyRunViaRemoteExecutor(
  run: AutonomyRun,
  executorUrl: string
): Promise<AutonomyExecutionResult> {
  const secret = remoteExecutorSecret();
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (secret) headers["x-codex-autonomy-secret"] = secret;
  let res: Response;
  try {
    res = await fetch(executorUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ run }),
    });
  } catch (error) {
    throw new Error(`REMOTE_EXECUTOR_FETCH_FAILED:${asText((error as Error)?.message).slice(0, 220)}`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    const message = asText(data?.error) || `REMOTE_EXECUTOR_HTTP_${res.status}`;
    throw new Error(message);
  }
  const result = asObject(data?.result);
  if (!result) throw new Error("REMOTE_EXECUTOR_INVALID_RESPONSE");
  const status = asText(result.status);
  if (status !== "completed" && status !== "failed") {
    throw new Error("REMOTE_EXECUTOR_INVALID_STATUS");
  }
  return {
    status: status as "completed" | "failed",
    verification: result.verification as VerificationResult | undefined,
    ship: result.ship as ShipResult | undefined,
    error: asText(result.error) || undefined,
  };
}

async function executeAutonomyRevertViaRemoteExecutor(
  run: AutonomyRun,
  executorUrl: string
): Promise<AutonomyRevertExecutionResult> {
  const secret = remoteExecutorSecret();
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (secret) headers["x-codex-autonomy-secret"] = secret;
  let res: Response;
  try {
    res = await fetch(executorUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "revert", run }),
    });
  } catch (error) {
    throw new Error(`REMOTE_EXECUTOR_FETCH_FAILED:${asText((error as Error)?.message).slice(0, 220)}`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    const message = asText(data?.error) || `REMOTE_EXECUTOR_HTTP_${res.status}`;
    throw new Error(message);
  }
  const result = asObject(data?.result);
  if (!result) throw new Error("REMOTE_EXECUTOR_INVALID_RESPONSE");
  const status = asText(result.status);
  if (status !== "completed" && status !== "failed") {
    throw new Error("REMOTE_EXECUTOR_INVALID_STATUS");
  }
  const revert = asObject(result.revert);
  return {
    status: status as "completed" | "failed",
    revert: revert
      ? {
          branch: asText(revert.branch),
          commitSha: asText(revert.commitSha),
          compareUrl: asText(revert.compareUrl) || undefined,
          prUrl: asText(revert.prUrl) || undefined,
        }
      : undefined,
    error: asText(result.error) || undefined,
  };
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
    repositoryHintsForTargetArea(input.targetArea).length
      ? `Repository notes:\n${repositoryHintsForTargetArea(input.targetArea).join("\n")}`
      : "",
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

async function buildProposedDiff(operations: ProposedOperation[], workspaceRoot: string) {
  const warnings: string[] = [];
  const items: ProposedDiffItem[] = [];
  for (const operation of operations) {
    const fullPath = path.join(workspaceRoot, operation.path);
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

function runShell(command: string, options?: { cwd?: string; timeoutMs?: number; envAdd?: Record<string, string> }) {
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
        PATH: process.env.PATH || DEFAULT_PATH_FALLBACK,
        HOME: process.env.HOME || "/tmp",
        LANG: process.env.LANG || "en_US.UTF-8",
        ...(options?.envAdd || {}),
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

function shellQuote(value: string) {
  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`;
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

  const appUiTouched = paths.some((p) => p.startsWith("app/"));
  if (appUiTouched) {
    return [
      { name: "Typecheck", command: "npx tsc --noEmit", timeoutMs: 180000 },
      { name: "Syntax", command: AUTONOMY_SYNTAX_CHECK_COMMAND, timeoutMs: 120000 },
    ];
  }

  return [{ name: "Typecheck", command: "npx tsc --noEmit", timeoutMs: 180000 }];
}

async function runSyntaxCheck(paths: string[], workspaceRoot: string, toolingRoot: string) {
  const started = Date.now();
  const candidates = paths
    .map((item) => normalizeRepoPath(item))
    .filter((item) => /\.(jsx?|tsx?|mjs|cjs)$/i.test(item))
    .map((item) => path.join(workspaceRoot, item));

  if (!candidates.length) {
    return { exitCode: 0 as number | null, durationMs: Date.now() - started, stdout: "", stderr: "", timedOut: false };
  }

  let ts: any;
  try {
    const toolingRequire = createRequire(path.join(toolingRoot, "package.json"));
    ts = toolingRequire("typescript");
  } catch (error) {
    return {
      exitCode: 1 as number | null,
      durationMs: Date.now() - started,
      stdout: "",
      stderr: `SYNTAX_CHECK_TYPESCRIPT_UNAVAILABLE:${asText((error as Error)?.message)}`,
      timedOut: false,
    };
  }

  const failures: string[] = [];
  for (const filePath of candidates) {
    let sourceText = "";
    try {
      sourceText = await readFile(filePath, "utf8");
    } catch {
      continue;
    }
    const ext = path.extname(filePath).toLowerCase();
    const scriptKind =
      ext === ".tsx"
        ? ts.ScriptKind.TSX
        : ext === ".ts"
        ? ts.ScriptKind.TS
        : ext === ".jsx"
        ? ts.ScriptKind.JSX
        : ts.ScriptKind.JS;
    const source = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
    const diagnostics = Array.isArray(source.parseDiagnostics) ? source.parseDiagnostics : [];
    for (const diag of diagnostics) {
      const start = Number(diag?.start || 0);
      const pos = source.getLineAndCharacterOfPosition(start);
      const message = ts.flattenDiagnosticMessageText(diag?.messageText || "Syntax error", "\n");
      failures.push(`${filePath}:${pos.line + 1}:${pos.character + 1} ${message}`);
    }
  }

  if (failures.length) {
    return {
      exitCode: 1 as number | null,
      durationMs: Date.now() - started,
      stdout: "",
      stderr: failures.slice(0, 50).join("\n"),
      timedOut: false,
    };
  }

  return { exitCode: 0 as number | null, durationMs: Date.now() - started, stdout: "", stderr: "", timedOut: false };
}

async function runVerification(
  paths: string[],
  workspaceRoot: string,
  toolingRoot = workspaceRoot
): Promise<VerificationResult> {
  const toolingNodeModules = path.join(toolingRoot, "node_modules");
  const toolingBin = path.join(toolingNodeModules, ".bin");
  const envAdd =
    toolingRoot !== workspaceRoot
      ? {
          PATH: `${toolingBin}:${process.env.PATH || DEFAULT_PATH_FALLBACK}`,
          NODE_PATH: process.env.NODE_PATH
            ? `${toolingNodeModules}:${process.env.NODE_PATH}`
            : toolingNodeModules,
        }
      : undefined;
  const checks: VerificationCheck[] = [];
  for (const check of checkCommandsForPaths(paths)) {
    let command = check.command;
    let result: {
      exitCode: number | null;
      durationMs: number;
      stdout: string;
      stderr: string;
      timedOut: boolean;
    };
    if (check.command === AUTONOMY_SYNTAX_CHECK_COMMAND) {
      result = await runSyntaxCheck(paths, workspaceRoot, toolingRoot);
    } else {
    if (toolingRoot !== workspaceRoot && check.command === "npx tsc --noEmit") {
      const tscBin = path.join(toolingNodeModules, "typescript", "bin", "tsc");
      command = `node ${shellQuote(tscBin)} --noEmit -p ${shellQuote(path.join(workspaceRoot, "tsconfig.json"))}`;
    }
      result = await runShell(command, {
        timeoutMs: check.timeoutMs,
        cwd: workspaceRoot,
        envAdd,
      });
    }
    checks.push({
      name: check.name,
      command,
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

async function ensureCleanWorktree(gitRoot: string) {
  const status = await runShell("git status --porcelain", { cwd: gitRoot });
  if (status.exitCode !== 0) {
    const detail = asText(status.stderr || status.stdout);
    if (detail) {
      throw new Error(`GIT_STATUS_FAILED:${detail.slice(0, 240)}`);
    }
    throw new Error(
      `GIT_STATUS_FAILED:exit=${String(status.exitCode)} timedOut=${status.timedOut ? "1" : "0"} cwd=${gitRoot}`
    );
  }
  if (asText(status.stdout)) {
    throw new Error("DIRTY_WORKTREE");
  }
}

async function ensureRuntimeSupportsGitAndWrites(workspaceRoot: string) {
  const gitVersion = await runShell("git --version", { cwd: workspaceRoot, timeoutMs: 8000 });
  if (gitVersion.exitCode !== 0) {
    const detail = asText(gitVersion.stderr || gitVersion.stdout);
    throw new Error(
      detail
        ? `AUTONOMY_RUNTIME_GIT_MISSING:${detail.slice(0, 240)}`
        : "AUTONOMY_RUNTIME_GIT_MISSING"
    );
  }
  try {
    await access(workspaceRoot, fsConstants.W_OK);
  } catch {
    throw new Error(`AUTONOMY_RUNTIME_READONLY:${workspaceRoot}`);
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

async function shipRunChanges(run: AutonomyRun, changedFiles: string[], gitRoot: string): Promise<ShipResult> {
  const originalBranchRes = await runShell("git rev-parse --abbrev-ref HEAD", { cwd: gitRoot });
  if (originalBranchRes.exitCode !== 0) throw new Error("GIT_BRANCH_READ_FAILED");
  const originalBranch = asText(originalBranchRes.stdout);
  const detachedHead = originalBranch === "HEAD";
  const remoteRes = await runShell("git config --get remote.origin.url", { cwd: gitRoot });
  const remoteHttps = remoteToHttps(remoteRes.stdout);

  if (run.policy.route === "direct_main") {
      if (!detachedHead && originalBranch !== "main") {
      const checkoutMain = await runShell("git checkout main", { cwd: gitRoot });
      if (checkoutMain.exitCode !== 0) throw new Error("GIT_CHECKOUT_MAIN_FAILED");
    }
    const addRes = await runShell(`git add ${changedFiles.map((item) => `'${item}'`).join(" ")}`, { cwd: gitRoot });
    if (addRes.exitCode !== 0) throw new Error("GIT_ADD_FAILED");
    const commitMessage = `codex: ${run.task.slice(0, 72)} [run:${run.id.slice(0, 8)}]`;
    const commitRes = await runShell(`git commit -m "${commitMessage.replace(/"/g, "'")}"`, { cwd: gitRoot });
    if (commitRes.exitCode !== 0) throw new Error("GIT_COMMIT_FAILED");
    const shaRes = await runShell("git rev-parse HEAD", { cwd: gitRoot });
    if (shaRes.exitCode !== 0) throw new Error("GIT_SHA_FAILED");
    const pushRes = await runShell(
      detachedHead ? "git push origin HEAD:main" : "git push origin main",
      { cwd: gitRoot }
    );
    if (pushRes.exitCode !== 0) throw new Error("GIT_PUSH_FAILED");

    if (originalBranch && !detachedHead && originalBranch !== "main") {
      await runShell(`git checkout ${originalBranch}`, { cwd: gitRoot });
    }

    return {
      route: run.policy.route,
      mode: "direct",
      branch: "main",
      commitSha: asText(shaRes.stdout),
    };
  }

  const branch = `codex/run-${run.id.slice(0, 8)}`;
  const checkoutBranch = await runShell(`git checkout -b ${branch}`, { cwd: gitRoot });
  if (checkoutBranch.exitCode !== 0) throw new Error("GIT_BRANCH_CREATE_FAILED");
  const addRes = await runShell(`git add ${changedFiles.map((item) => `'${item}'`).join(" ")}`, { cwd: gitRoot });
  if (addRes.exitCode !== 0) throw new Error("GIT_ADD_FAILED");
  const commitMessage = `codex: ${run.task.slice(0, 72)} [run:${run.id.slice(0, 8)}]`;
  const commitRes = await runShell(`git commit -m "${commitMessage.replace(/"/g, "'")}"`, { cwd: gitRoot });
  if (commitRes.exitCode !== 0) throw new Error("GIT_COMMIT_FAILED");
  const shaRes = await runShell("git rev-parse HEAD", { cwd: gitRoot });
  if (shaRes.exitCode !== 0) throw new Error("GIT_SHA_FAILED");
  const pushRes = await runShell(`git push -u origin ${branch}`, { cwd: gitRoot });
  if (pushRes.exitCode !== 0) throw new Error("GIT_PUSH_FAILED");

  if (originalBranch) {
    await runShell(`git checkout ${originalBranch}`, { cwd: gitRoot });
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

async function applyOperations(operations: ProposedOperation[], workspaceRoot: string) {
  const backups = new Map<string, string>();
  const changedFiles = new Set<string>();
  for (const operation of operations) {
    const fullPath = path.join(workspaceRoot, operation.path);
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

async function restoreBackups(backups: Map<string, string>, workspaceRoot: string) {
  for (const [filePath, content] of backups.entries()) {
    const fullPath = path.join(workspaceRoot, filePath);
    await writeFile(fullPath, content);
  }
}

async function ensureWorktreeDependencyLinks(sourceWorkspaceRoot: string, isolatedWorkspaceRoot: string) {
  const sourceNodeModules = path.join(sourceWorkspaceRoot, "node_modules");
  const isolatedNodeModules = path.join(isolatedWorkspaceRoot, "node_modules");
  if (!(await pathExists(sourceNodeModules))) return;
  if (await pathExists(isolatedNodeModules)) return;
  try {
    await symlink(sourceNodeModules, isolatedNodeModules, "dir");
  } catch {
    // Best-effort: if linking fails, verification will surface a concrete tool error.
  }
}

async function executeAutonomyRunInWorkspace(
  run: AutonomyRun,
  workspaceRoot: string,
  gitRoot: string,
  toolingRoot = workspaceRoot
): Promise<AutonomyExecutionResult> {
  const { backups, changedFiles } = await applyOperations(run.plan.operations, workspaceRoot);
  let needsRestore = true;
  try {
    const verification = await runVerification(changedFiles, workspaceRoot, toolingRoot);
    if (!verification.passed) {
      await restoreBackups(backups, workspaceRoot);
      needsRestore = false;
      return {
        status: "failed",
        verification,
        error: "VERIFICATION_FAILED",
      };
    }

    const ship = await shipRunChanges(run, changedFiles, gitRoot);
    needsRestore = false;
    return {
      status: "completed",
      verification,
      ship,
    };
  } catch (error) {
    if (needsRestore) {
      await restoreBackups(backups, workspaceRoot).catch(() => {});
    }
    return {
      status: "failed",
      error: String((error as Error)?.message || "RUN_FAILED"),
    };
  }
}

export async function executeAutonomyRunOnCurrentHost(run: AutonomyRun): Promise<AutonomyExecutionResult> {
  const workspaceRoot = await resolveWorkspaceRoot();
  await ensureRuntimeSupportsGitAndWrites(workspaceRoot);
  const gitRoot = await resolveGitRoot();

  const status = await runShell("git status --porcelain", { cwd: gitRoot });
  if (status.exitCode !== 0) {
    const detail = asText(status.stderr || status.stdout);
    return {
      status: "failed",
      error: detail ? `GIT_STATUS_FAILED:${detail.slice(0, 240)}` : "GIT_STATUS_FAILED",
    };
  }

  // Worker environments can have unrelated local edits; isolate execution in a temporary
  // worktree so approvals are not blocked by pre-existing dirty state.
  const dirty = Boolean(asText(status.stdout));
  if (!dirty) {
    return executeAutonomyRunInWorkspace(run, workspaceRoot, gitRoot, workspaceRoot);
  }

  const relativeWorkspace = path.relative(gitRoot, workspaceRoot);
  const tempWorktreeRoot = await mkdtemp(path.join(tmpdir(), "codex-autonomy-"));
  const addWorktree = await runShell(
    `git worktree add --detach ${shellQuote(tempWorktreeRoot)} HEAD`,
    { cwd: gitRoot, timeoutMs: 45000 }
  );
  if (addWorktree.exitCode !== 0) {
    await runShell(`rm -rf ${shellQuote(tempWorktreeRoot)}`, { timeoutMs: 20000 }).catch(() => {});
    return {
      status: "failed",
      error: "GIT_WORKTREE_ADD_FAILED",
    };
  }

  const isolatedWorkspaceRoot =
    relativeWorkspace && !relativeWorkspace.startsWith("..")
      ? path.join(tempWorktreeRoot, relativeWorkspace)
      : tempWorktreeRoot;

  try {
    await ensureWorktreeDependencyLinks(workspaceRoot, isolatedWorkspaceRoot);
    return await executeAutonomyRunInWorkspace(
      run,
      isolatedWorkspaceRoot,
      tempWorktreeRoot,
      workspaceRoot
    );
  } finally {
    const removeWorktree = await runShell(
      `git worktree remove --force ${shellQuote(tempWorktreeRoot)}`,
      { cwd: gitRoot, timeoutMs: 45000 }
    );
    if (removeWorktree.exitCode !== 0) {
      await runShell(`rm -rf ${shellQuote(tempWorktreeRoot)}`, { timeoutMs: 20000 }).catch(() => {});
    }
  }
}

async function executeAutonomyRevertInWorkspace(
  run: AutonomyRun,
  gitRoot: string
): Promise<AutonomyRevertExecutionResult> {
  if (!run.ship?.commitSha) {
    return {
      status: "failed",
      error: "RUN_NOT_REVERTABLE",
    };
  }

  const originalBranchRes = await runShell("git rev-parse --abbrev-ref HEAD", { cwd: gitRoot });
  if (originalBranchRes.exitCode !== 0) {
    return {
      status: "failed",
      error: "GIT_BRANCH_READ_FAILED",
    };
  }
  const originalBranch = asText(originalBranchRes.stdout);
  if (originalBranch !== "main") {
    const checkoutMain = await runShell("git checkout main", { cwd: gitRoot });
    if (checkoutMain.exitCode !== 0) {
      return {
        status: "failed",
        error: "GIT_CHECKOUT_MAIN_FAILED",
      };
    }
  }

  const suffix = Date.now().toString(36).slice(-4);
  const revertBranch = `revert/run-${run.id.slice(0, 8)}-${suffix}`;
  const createBranch = await runShell(`git checkout -b ${revertBranch}`, { cwd: gitRoot });
  if (createBranch.exitCode !== 0) {
    return {
      status: "failed",
      error: "REVERT_BRANCH_CREATE_FAILED",
    };
  }
  const revert = await runShell(`git revert --no-edit ${run.ship.commitSha}`, { cwd: gitRoot });
  if (revert.exitCode !== 0) {
    if (originalBranch && originalBranch !== "HEAD" && originalBranch !== revertBranch) {
      await runShell(`git checkout ${originalBranch}`, { cwd: gitRoot }).catch(() => {});
    }
    return {
      status: "failed",
      error: "GIT_REVERT_FAILED",
    };
  }
  const shaRes = await runShell("git rev-parse HEAD", { cwd: gitRoot });
  if (shaRes.exitCode !== 0) {
    return {
      status: "failed",
      error: "GIT_SHA_FAILED",
    };
  }
  const pushRes = await runShell(`git push -u origin ${revertBranch}`, { cwd: gitRoot });
  if (pushRes.exitCode !== 0) {
    return {
      status: "failed",
      error: "GIT_PUSH_FAILED",
    };
  }

  const remoteRes = await runShell("git config --get remote.origin.url", { cwd: gitRoot });
  const remoteHttps = remoteToHttps(remoteRes.stdout);
  const compareUrl = remoteHttps ? `${remoteHttps}/compare/main...${revertBranch}` : undefined;

  if (originalBranch && originalBranch !== "HEAD" && originalBranch !== revertBranch) {
    await runShell(`git checkout ${originalBranch}`, { cwd: gitRoot }).catch(() => {});
  }

  return {
    status: "completed",
    revert: {
      branch: revertBranch,
      commitSha: asText(shaRes.stdout),
      compareUrl,
      prUrl: compareUrl ? `${compareUrl}?expand=1` : undefined,
    },
  };
}

export async function executeAutonomyRevertOnCurrentHost(
  run: AutonomyRun
): Promise<AutonomyRevertExecutionResult> {
  const workspaceRoot = await resolveWorkspaceRoot();
  await ensureRuntimeSupportsGitAndWrites(workspaceRoot);
  const gitRoot = await resolveGitRoot();
  await ensureCleanWorktree(gitRoot);
  return executeAutonomyRevertInWorkspace(run, gitRoot);
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
  const workspaceRoot = await resolveWorkspaceRoot();

  const intentAwareOps = await deriveIntentAwareOperations(task, targetArea, workspaceRoot).catch(() => []);
  let planned =
    intentAwareOps.length > 0
      ? ({
          reasoning: "Applied an intent-aware deterministic footer insertion rule.",
          summary: "Prepared a deterministic footer text insertion.",
          operations: intentAwareOps,
        } satisfies PlannerResponse)
      : await planOperations({
          task,
          targetArea,
          model,
        });
  let operations = planned.operations;
  let scopeWarnings = validateOperationScope(targetArea, operations);
  let diff: { items: ProposedDiffItem[]; warnings: string[] } | null = null;
  try {
    diff = await buildProposedDiff(operations, workspaceRoot);
  } catch (error) {
    const code = String((error as Error)?.message || "");
    if (code !== "NO_APPLICABLE_OPERATIONS") throw error;
    const fallbackOps = await deriveHeuristicOperations(task, targetArea, workspaceRoot).catch(() => []);
    if (fallbackOps.length) {
      operations = fallbackOps;
      scopeWarnings = validateOperationScope(targetArea, operations);
      diff = await buildProposedDiff(operations, workspaceRoot);
      scopeWarnings.push("Used heuristic fallback to locate exact text/file match.");
    } else {
      const contextualPlan = await planOperationsWithRepoContext({
        task,
        targetArea,
        model,
        workspaceRoot,
      });
      operations = contextualPlan.operations;
      planned = contextualPlan;
      scopeWarnings = validateOperationScope(targetArea, operations);
      diff = await buildProposedDiff(operations, workspaceRoot);
      scopeWarnings.push("Used context-aware fallback planning from repo snippets.");
    }
  }
  const touchedPaths = operations.map((item) => normalizeRepoPath(item.path));
  const policy = classifyPolicy(targetArea, touchedPaths);

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
      operations,
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

    let run: AutonomyRun = {
      ...existing,
      status: "running",
      approvedAt: nowIso(),
    };
    run = appendTimeline(run, "approved_apply", "Approval received.");
    await updateRunStore(run);

    const executor = remoteExecutorUrl();
    try {
      run = appendTimeline(
        run,
        "verify",
        executor
          ? `Delegating apply/verify/ship to remote executor: ${executor}`
          : "Running verification checks."
      );
      await updateRunStore(run);

      const execution = executor
        ? await executeAutonomyRunViaRemoteExecutor(run, executor)
        : await executeAutonomyRunOnCurrentHost(run);

      if (execution.verification) {
        run = {
          ...run,
          verification: execution.verification,
        };
        await updateRunStore(run);
      }

      if (execution.status !== "completed" || !execution.ship) {
        run = appendTimeline(
          run,
          "failed",
          executor ? "Remote executor reported failure." : "Run failed during apply/verify/ship."
        );
        run = {
          ...run,
          status: "failed",
          stage: "failed",
          failedAt: nowIso(),
          error: execution.error || "RUN_FAILED",
        };
        await updateRunStore(run);
        return run;
      }

      run = appendTimeline(run, "ship", executor ? "Remote executor shipped changes." : "Shipping changes.");
      run = {
        ...run,
        ship: execution.ship,
      };
      await updateRunStore(run);

      run = appendTimeline(run, "completed", "Run completed successfully.");
      run = {
        ...run,
        status: "completed",
        stage: "completed",
        completedAt: nowIso(),
        ship: execution.ship,
      };
      await updateRunStore(run);
      return run;
    } catch (error) {
      run = appendTimeline(
        run,
        "failed",
        executor ? "Remote executor request failed." : "Run failed during apply/verify/ship."
      );
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
  const executor = remoteExecutorUrl();
  const execution = executor
    ? await executeAutonomyRevertViaRemoteExecutor(existing, executor)
    : await executeAutonomyRevertOnCurrentHost(existing);
  if (execution.status !== "completed" || !execution.revert) {
    throw new Error(execution.error || "AUTONOMY_REVERT_FAILED");
  }
  const revertResult: RevertResult = execution.revert;
  const updated: AutonomyRun = {
    ...existing,
    revert: revertResult,
    updatedAt: nowIso(),
  };
  await updateRunStore(updated);
  return updated;
}
