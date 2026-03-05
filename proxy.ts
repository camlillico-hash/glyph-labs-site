import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "crm_session";

function ownerToken() {
  const secret = process.env.CRM_SESSION_SECRET || "local-dev-secret";
  return `${secret}:owner`;
}

function guestToken() {
  const secret = process.env.CRM_SESSION_SECRET || "local-dev-secret";
  return `${secret}:guest`;
}

function roleFromToken(token?: string) {
  if (!token) return null;
  if (token === ownerToken()) return "owner" as const;
  if (token === guestToken()) return "guest" as const;
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/crm") && !pathname.startsWith("/api/crm")) return NextResponse.next();
  if (pathname.startsWith("/crm/login") || pathname.startsWith("/api/crm/auth") || pathname.startsWith("/api/crm/gmail/callback")) {
    return NextResponse.next();
  }

  const role = roleFromToken(req.cookies.get(COOKIE_NAME)?.value);
  if (!role) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/crm/login";
    return NextResponse.redirect(url);
  }

  if (role === "guest" && pathname.startsWith("/api/crm") && req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.json({ error: "Guest access is view-only" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*"],
};
