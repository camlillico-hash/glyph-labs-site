import { NextResponse } from "next/server";
import { CONTACT_STAGES, DEAL_STAGES, getStore, id, now, saveStore } from "@/lib/crm-store";

function normalizeStatus(value: string | undefined) {
  const v = String(value || "").trim();
  if (!v) return "New";
  return (CONTACT_STAGES as readonly string[]).includes(v) ? v : "New";
}

function normalizePrimaryPain(value: any) {
  const v = String(value || "").trim();
  return ["Execution", "Strategy", "Culture"].includes(v) ? v : undefined;
}

function normalizeEmail(value: any) {
  return String(value || "").trim().toLowerCase();
}

function statusNeedsEmail(status: string) {
  return ["Connected", "Discovery meeting booked", "Not right now"].includes(status);
}

function upsertContactStamp(store: any, contact: any) {
  if (contact.status !== "Discovery meeting booked") return;
  const idx = (store.contactStamps || []).findIndex((s: any) => s.contactId === contact.id);
  const stamp = {
    id: idx >= 0 ? store.contactStamps[idx].id : id(),
    contactId: contact.id,
    name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Unnamed contact",
    company: contact.company || "",
    email: contact.email || "",
    wonAt: idx >= 0 ? store.contactStamps[idx].wonAt : now(),
    removedAt: undefined,
  };
  if (idx >= 0) store.contactStamps[idx] = stamp;
  else store.contactStamps = [stamp, ...(store.contactStamps || [])];
}

function maybeCreateDealForDiscovery(store: any, contact: any) {
  if (contact.status !== "Discovery meeting booked") return;
  const exists = store.deals.some((d: any) => d.contactId === contact.id && d.stage !== "Lost");
  if (exists) return;

  const company = String(contact.company || "").trim();
  const fallback = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "New Contact";
  const nameBase = company || fallback;
  store.deals.unshift({
    id: id(),
    name: `${nameBase} - BOS360`,
    contactId: contact.id,
    company: company || "",
    stage: DEAL_STAGES[0],
    primaryPain: normalizePrimaryPain(contact.primaryPain),
    leadSource: contact.leadSource || "",
    createdAt: now(),
    updatedAt: now(),
    nextStep: "Run discovery meeting",
  });
}

export async function GET() {
  const store = await getStore();
  const contacts = (store.contacts || []).map((c: any) => {
    const acts = (store.activities || []).filter((a: any) => a.contactId === c.id)
      .sort((a: any, b: any) => new Date(b.occurredAt || b.createdAt).getTime() - new Date(a.occurredAt || a.createdAt).getTime());
    const latest = acts[0];
    return {
      ...c,
      lastActivityDate: c.lastActivityDate || latest?.occurredAt || "",
      lastActivityType: c.lastActivityType || latest?.type || "",
    };
  });
  return NextResponse.json({ contacts, contactStamps: store.contactStamps || [], stages: CONTACT_STAGES });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!String(body.firstName || "").trim() || !String(body.lastName || "").trim()) {
    return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
  }

  const store = await getStore();
  const status = normalizeStatus(body.status);
  const email = normalizeEmail(body.email);
  if (statusNeedsEmail(status) && !email) {
    return NextResponse.json({ error: "Email is required for Connected and later stages" }, { status: 400 });
  }
  if (email && store.contacts.some((c: any) => normalizeEmail(c.email) === email)) {
    return NextResponse.json({ error: "A contact with this email already exists" }, { status: 400 });
  }
  const record = { id: id(), createdAt: now(), updatedAt: now(), status, ...body, email, primaryPain: normalizePrimaryPain(body.primaryPain) };
  maybeCreateDealForDiscovery(store, record);
  upsertContactStamp(store, record);
  store.contacts.unshift(record);
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  if (!String(body.firstName || "").trim() || !String(body.lastName || "").trim()) {
    return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
  }

  const store = await getStore();
  const idx = store.contacts.findIndex((c) => c.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = normalizeStatus(body.status);
  const email = normalizeEmail(body.email);
  if (statusNeedsEmail(status) && !email) {
    return NextResponse.json({ error: "Email is required for Connected and later stages" }, { status: 400 });
  }
  if (email && store.contacts.some((c: any, i: number) => i !== idx && normalizeEmail(c.email) === email)) {
    return NextResponse.json({ error: "A contact with this email already exists" }, { status: 400 });
  }
  const updated = { ...store.contacts[idx], ...body, status, email, primaryPain: normalizePrimaryPain(body.primaryPain), updatedAt: now() };
  maybeCreateDealForDiscovery(store, updated);
  upsertContactStamp(store, updated);
  store.contacts[idx] = updated;

  await saveStore(store);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const stampId = searchParams.get("stampId");
  const store = await getStore();

  if (stampId) {
    store.contactStamps = (store.contactStamps || []).filter((s: any) => s.id !== stampId);
    await saveStore(store);
    return NextResponse.json({ ok: true });
  }

  store.contacts = store.contacts.filter((c) => c.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
