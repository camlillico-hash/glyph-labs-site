import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";
import { resolveActiveAccountId } from "@/lib/crm-scope";

const ALLOWED_TYPES = ["Influencer", "Decision maker", "Networker", "Other"];
const ALLOWED_STAGES = ["New", "Attempting", "Connected", "Discovery meeting booked", "Not right now"];
const ALLOWED_PRIMARY_PAIN = ["Execution", "Strategy", "Culture"];

function norm(v: any) {
  const out = String(v ?? "").trim();
  if (out === "?" || out === "N/A" || out === "n/a") return "";
  return out;
}

function formatPhone(v: any) {
  const raw = norm(v);
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";

  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }

  return raw;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  if (!rows.length) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  const existingEmails = new Set((store.contacts || []).map((c: any) => norm(c.email).toLowerCase()).filter(Boolean));

  let created = 0;
  let skipped = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  rows.forEach((r: any, idx: number) => {
    const firstName = norm(r.firstName || r.First || r["First name"] || r["first_name"]);
    const lastName = norm(r.lastName || r.Last || r["Last name"] || r["last_name"]);
    const email = norm(r.email || r.Email).toLowerCase();
    if (!firstName || !lastName) {
      skipped++; errors.push({ row: idx + 1, reason: "Missing firstName/lastName" }); return;
    }
    if (email && existingEmails.has(email)) {
      skipped++; errors.push({ row: idx + 1, reason: "Duplicate email" }); return;
    }

    const type = norm(r.type || r.Type);
    const status = norm(r.status || r["Lead Status"] || r.Stage || r.stage);
    const primaryPain = norm(r.primaryPain || r["Primary pain"] || r["Primary Pain"]);

    const contact: any = {
      id: id(),
      firstName,
      lastName,
      email: norm(r.email || r.Email),
      phone: formatPhone(r.phone || r.Phone),
      linkedin: norm(r.linkedin || r.Linkedin || r.LinkedIn || r["LinkedIn"] || r["linkedin_url"]),
      company: norm(r.company || r.Company),
      title: norm(r.title || r.Title),
      type: ALLOWED_TYPES.includes(type) ? type : "",
      leadSource: norm(r.leadSource || r["Lead source"] || r["Lead Source"] || r.source),
      primaryPain: ALLOWED_PRIMARY_PAIN.includes(primaryPain) ? primaryPain : undefined,
      status: ALLOWED_STAGES.includes(status) ? status : "New",
      notes: norm(r.notes || r.Notes),
      createdAt: now(),
      updatedAt: now(),
    };

    store.contacts.unshift(contact);
    if (email) existingEmails.add(email);
    created++;
  });

  await saveStore(store, accountId);
  return NextResponse.json({ ok: true, created, skipped, errors: errors.slice(0, 50) });
}
