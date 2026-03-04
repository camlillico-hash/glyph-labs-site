import { NextRequest, NextResponse } from "next/server";
const COOKIE_NAME = "crm_session";

function token() {
  return process.env.CRM_SESSION_SECRET || "local-dev-secret";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/crm") && !pathname.startsWith("/api/crm")) return NextResponse.next();
  if (pathname.startsWith("/crm/login") || pathname.startsWith("/api/crm/auth") || pathname.startsWith("/api/crm/gmail/callback")) {
    return NextResponse.next();
  }

  const authed = req.cookies.get(COOKIE_NAME)?.value === token();
  if (!authed) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/crm/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*"],
};
