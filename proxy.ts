import { NextRequest, NextResponse } from "next/server";
import { isLocalCrmBypassEnabled, parseSessionToken, sessionCookieName } from "@/lib/crm-auth";

const PUBLIC_CRM_API_PATHS = ["/api/crm/auth", "/api/crm/gmail/callback", "/api/crm/coach"];
const PUBLIC_CODEX_API_PATHS = ["/api/codex/autonomy/execute"];
const PROTECTED_PREFIXES = ["/crm", "/api/crm", "/codex", "/api/codex"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();
  if (isLocalCrmBypassEnabled()) return NextResponse.next();
  if (
    pathname.startsWith("/crm/login") ||
    PUBLIC_CRM_API_PATHS.some((publicPath) => pathname.startsWith(publicPath)) ||
    PUBLIC_CODEX_API_PATHS.some((publicPath) => pathname.startsWith(publicPath))
  ) {
    return NextResponse.next();
  }

  const session = parseSessionToken(req.cookies.get(sessionCookieName)?.value);
  const role = session?.role || null;
  if (!role) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/crm/login";
    if (!pathname.startsWith("/crm")) {
      const search = req.nextUrl.search || "";
      url.searchParams.set("next", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  }

  if (role === "guest" && pathname.startsWith("/api/crm") && req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.json({ error: "Guest access is view-only" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*", "/codex/:path*", "/api/codex/:path*"],
};
