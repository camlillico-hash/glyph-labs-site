import { NextResponse } from "next/server";
import { CONTACT_STAGES, DEAL_STAGES, getStore, id, now, saveStore } from "@/lib/crm-store";

function normalizeStatus(value: string | undefined) {
  const v = String(value || "").trim();
  if (!v) return "New";
  return (CONTACT_STAGES as readonly string[]).includes(v) ? v : "New";
}

function maybeCreateDealForDiscovery(store: any, contact: any) {
  if (contact.status !== "Discovery meeting booked") return;
  const exists = store.deals.some((d: any) => d.contactId === contact.id);
  if (exists) return;

  const nameBase = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "New Contact";
  store.deals.unshift({
    id: id(),
    name: `${nameBase} - Coaching Opportunity`,
    contactId: contact.id,
    company: contact.company || "",
    stage: DEAL_STAGES[0],
    createdAt: now(),
    updatedAt: now(),
    nextStep: "Run discovery meeting",
  });
}

export async function GET() {
  const store = await getStore();
  return NextResponse.json({ contacts: store.contacts, stages: CONTACT_STAGES });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!String(body.firstName || "").trim() || !String(body.lastName || "").trim()) {
    return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
  }

  const store = await getStore();
  const record = { id: id(), createdAt: now(), updatedAt: now(), status: normalizeStatus(body.status), ...body };
  maybeCreateDealForDiscovery(store, record);
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

  const updated = { ...store.contacts[idx], ...body, status: normalizeStatus(body.status), updatedAt: now() };
  maybeCreateDealForDiscovery(store, updated);
  store.contacts[idx] = updated;

  await saveStore(store);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const store = await getStore();
  store.contacts = store.contacts.filter((c) => c.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
