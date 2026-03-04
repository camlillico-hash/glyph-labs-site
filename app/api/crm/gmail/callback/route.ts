import { NextResponse } from "next/server";
import { storeGoogleCode } from "@/lib/gmail";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/crm/settings?gmail=error", req.url));

  try {
    await storeGoogleCode(code);
    return NextResponse.redirect(new URL("/crm/settings?gmail=connected", req.url));
  } catch {
    return NextResponse.redirect(new URL("/crm/settings?gmail=error", req.url));
  }
}
