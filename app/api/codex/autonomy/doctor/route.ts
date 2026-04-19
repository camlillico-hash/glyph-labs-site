import { spawn } from "node:child_process";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireCrmSession } from "@/lib/crm-scope";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_OUTPUT = 1200;

function asText(value: unknown) {
  return String(value || "").trim();
}

function clip(value: string, max = MAX_OUTPUT) {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.map((item) => asText(item)).filter(Boolean)));
}

function candidateRoots() {
  const cwd = process.cwd();
  const parent = path.dirname(cwd);
  const grandparent = path.dirname(parent);
  return dedupe([
    process.env.CODEX_REPO_ROOT || "",
    process.env.CODEX_WORKSPACE_ROOT || "",
    cwd,
    parent,
    grandparent,
    path.join(cwd, "bos360-site"),
    path.join(parent, "bos360-site"),
    path.join(grandparent, "bos360-site"),
  ]);
}

function runShell(command: string, cwd: string, timeoutMs = 15000) {
  return new Promise<{
    exitCode: number | null;
    timedOut: boolean;
    stdout: string;
    stderr: string;
  }>((resolve) => {
    const child = spawn("/bin/bash", ["-lc", command], {
      cwd,
      env: {
        ...process.env,
        PATH:
          process.env.PATH || "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        HOME: process.env.HOME || "/tmp",
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
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: typeof code === "number" ? code : null,
        timedOut,
        stdout: clip(stdout.trim()),
        stderr: clip(stderr.trim()),
      });
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: null,
        timedOut,
        stdout: clip(stdout.trim()),
        stderr: clip(`${stderr}\n${String(error.message || error)}`.trim()),
      });
    });
  });
}

function classifyLikelyIssue(value: {
  gitFound: boolean;
  repoDetected: boolean;
  statusExitCode: number | null;
  statusStderr: string;
  statusStdout: string;
}) {
  if (!value.gitFound) return "git_binary_missing";
  if (!value.repoDetected) return "git_repository_not_found";
  const stderr = value.statusStderr.toLowerCase();
  if (value.statusExitCode !== 0) {
    if (stderr.includes("dubious ownership")) return "git_safe_directory_required";
    if (stderr.includes("not a git repository")) return "git_repository_not_found";
    if (value.statusExitCode === null) return "git_status_process_error";
    return "git_status_failed";
  }
  if (asText(value.statusStdout)) return "dirty_worktree";
  return "clean_worktree";
}

export async function GET() {
  try {
    await requireCrmSession();
    const cwd = process.cwd();
    const envInfo = {
      nodeEnv: asText(process.env.NODE_ENV),
      vercel: asText(process.env.VERCEL),
      vercelCommit: asText(process.env.VERCEL_GIT_COMMIT_SHA),
      vercelBranch: asText(process.env.VERCEL_GIT_COMMIT_REF),
      cwd,
    };

    const gitPath = await runShell("command -v git", cwd, 8000);
    const gitVersion = await runShell("git --version", cwd, 8000);
    const roots = candidateRoots().slice(0, 8);

    const probes: Array<{
      candidate: string;
      revParse: { exitCode: number | null; timedOut: boolean; stdout: string; stderr: string };
      status?: { exitCode: number | null; timedOut: boolean; stdout: string; stderr: string };
    }> = [];

    for (const root of roots) {
      const revParse = await runShell("git rev-parse --show-toplevel", root, 8000);
      if (revParse.exitCode === 0 && asText(revParse.stdout)) {
        const repoRoot = asText(revParse.stdout);
        const status = await runShell("git status --porcelain", repoRoot, 12000);
        probes.push({ candidate: root, revParse, status });
      } else {
        probes.push({ candidate: root, revParse });
      }
    }

    const firstRepoProbe = probes.find((item) => item.revParse.exitCode === 0 && asText(item.revParse.stdout));
    const likelyIssue = classifyLikelyIssue({
      gitFound: gitPath.exitCode === 0,
      repoDetected: Boolean(firstRepoProbe),
      statusExitCode: firstRepoProbe?.status?.exitCode ?? null,
      statusStderr: firstRepoProbe?.status?.stderr || "",
      statusStdout: firstRepoProbe?.status?.stdout || "",
    });

    return NextResponse.json(
      {
        ok: true,
        env: envInfo,
        gitPath,
        gitVersion,
        probes,
        likelyIssue,
        now: new Date().toISOString(),
      },
      { headers: { "cache-control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const code = asText((error as Error)?.message || "AUTONOMY_DOCTOR_FAILED");
    const status = code === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ ok: false, error: code }, { status });
  }
}
