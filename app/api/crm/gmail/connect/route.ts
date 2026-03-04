import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/gmail";

export async function GET() {
  const url = getGoogleAuthUrl();
  if (!url) return NextResponse.json({ error: "Google OAuth not configured" }, { status: 400 });
  return NextResponse.redirect(url);
}
