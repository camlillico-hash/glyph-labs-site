import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";

const ALLOWED_TYPES = ["Influencer", "Decision maker", "Networker", "Other"];
const ALLOWED_STAGES = ["New", "Attempting", "Connected", "Discovery meeting booked", "Not right now"];

function norm(v: any) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  if (!rows.length) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  const store = await getStore();
  const existingEmails = new Set((store.contacts || []).map((c: any) => norm(c.email).toLowerCase()).filter(Boolean));

  let created = 0;
  let skipped = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  rows.forEach((r: any, idx: number) => {
    const firstName = norm(r.firstName || r["First name"] || r["first_name"]);
    const lastName = norm(r.lastName || r["Last name"] || r["last_name"]);
    const email = norm(r.email || r.Email).toLowerCase();
    if (!firstName || !lastName) {
      skipped++; errors.push({ row: idx + 1, reason: "Missing firstName/lastName" }); return;
    }
    if (email && existingEmails.has(email)) {
      skipped++; errors.push({ row: idx + 1, reason: "Duplicate email" }); return;
    }

    const type = norm(r.type || r.Type);
    const status = norm(r.status || r.Stage || r.stage);

    const contact: any = {
      id: id(),
      firstName,
      lastName,
      email: norm(r.email || r.Email),
      phone: norm(r.phone || r.Phone),
      company: norm(r.company || r.Company),
      title: norm(r.title || r.Title),
      type: ALLOWED_TYPES.includes(type) ? type : "",
      leadSource: norm(r.leadSource || r["Lead source"] || r.source),
      status: ALLOWED_STAGES.includes(status) ? status : "New",
      notes: norm(r.notes || r.Notes),
      createdAt: now(),
      updatedAt: now(),
    };

    store.contacts.unshift(contact);
    if (email) existingEmails.add(email);
    created++;
  });

  await saveStore(store);
  return NextResponse.json({ ok: true, created, skipped, errors: errors.slice(0, 50) });
}
