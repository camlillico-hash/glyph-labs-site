import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function shortSha(value: string) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  return normalized.slice(0, 8);
}

export async function GET() {
  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.COMMIT_SHA ||
    "";

  const branch =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GITHUB_REF_NAME ||
    process.env.BRANCH ||
    "";

  return NextResponse.json(
    {
      ok: true,
      commitSha: String(commitSha || ""),
      commitShort: shortSha(commitSha),
      branch: String(branch || ""),
      nodeEnv: String(process.env.NODE_ENV || ""),
      now: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    }
  );
}

