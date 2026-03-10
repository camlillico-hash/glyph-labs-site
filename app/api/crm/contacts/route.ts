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

function normalizeDisqualificationReason(value: any) {
  const v = String(value || "").trim();
  const allowed = ["Couldn't connect", "Went cold", "Said no", "Not the right person", "Other"];
  return allowed.includes(v) ? v : undefined;
}

function normalizeWhatNow(value: any) {
  const v = String(value || "").trim();
  return ["Leave them", "Nurture (future)"].includes(v) ? v : undefined;
}

function statusNeedsDisqualification(status: string) {
  return status === "Not right now";
}

function plusMonthsIsoDate(baseIso: string, months: number) {
  const d = new Date(baseIso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function syncContactStamp(store: any, previous: any | null, contact: any) {
  const stamps = store.contactStamps || (store.contactStamps = []);
  const idx = stamps.findIndex((s: any) => s.contactId === contact.id);

  if (contact.status === "Discovery meeting booked") {
    const stamp = {
      id: idx >= 0 ? stamps[idx].id : id(),
      contactId: contact.id,
      name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Unnamed contact",
      company: contact.company || "",
      email: contact.email || "",
      wonAt: idx >= 0 ? stamps[idx].wonAt : now(),
      removedAt: undefined,
    };
    if (idx >= 0) stamps[idx] = stamp;
    else store.contactStamps = [stamp, ...stamps];
    return;
  }

  const wasConverted = previous?.status === "Discovery meeting booked";
  if (idx >= 0 && wasConverted) {
    store.contactStamps = stamps.filter((s: any) => s.contactId !== contact.id);
  }
}

function maybeCreateNurtureTaskForContact(store: any, previous: any | null, contact: any) {
  if (contact.status !== "Not right now") return;
  if (contact.whatNow !== "Nurture (future)") return;

  const transitionedToNRN = !previous || previous.status !== "Not right now" || previous.whatNow !== "Nurture (future)";
  if (!transitionedToNRN) return;

  const existing = (store.tasks || []).some((t: any) =>
    t.followUpKind === "nurture_reactivate" &&
    t.followUpForContactId === contact.id &&
    t.status !== "Completed" && t.status !== "Canceled"
  );
  if (existing) return;

  (store.tasks || (store.tasks = [])).unshift({
    id: id(),
    title: "Check-in with a value-add nudge",
    type: "email",
    relatedType: "contact",
    relatedId: contact.id,
    followUpForContactId: contact.id,
    followUpKind: "nurture_reactivate",
    dueDate: plusMonthsIsoDate(now(), 4),
    status: "Not started",
    done: false,
    notes: "Auto-created from Not right now → Nurture (future).",
    createdAt: now(),
    updatedAt: now(),
  });
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
    name: `${nameBase} - Glyph Labs`,
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
      lastActivityDate: latest?.occurredAt || "",
      lastActivityType: latest?.type || "",
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
  const disqualificationReason = normalizeDisqualificationReason(body.disqualificationReason);
  const whatNow = normalizeWhatNow(body.whatNow);
  if (statusNeedsEmail(status) && !email) {
    return NextResponse.json({ error: "Email is required for Connected and later stages" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !disqualificationReason) {
    return NextResponse.json({ error: "Disqualification reason is required for Not right now" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !whatNow) {
    return NextResponse.json({ error: "What now? is required for Not right now" }, { status: 400 });
  }
  if (email && store.contacts.some((c: any) => normalizeEmail(c.email) === email)) {
    return NextResponse.json({ error: "A contact with this email already exists" }, { status: 400 });
  }
  const record = { id: id(), createdAt: now(), updatedAt: now(), status, ...body, email, disqualificationReason, whatNow, primaryPain: normalizePrimaryPain(body.primaryPain) };
  maybeCreateDealForDiscovery(store, record);
  maybeCreateNurtureTaskForContact(store, null, record);
  syncContactStamp(store, null, record);
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
  const disqualificationReason = normalizeDisqualificationReason(body.disqualificationReason);
  const whatNow = normalizeWhatNow(body.whatNow);
  if (statusNeedsEmail(status) && !email) {
    return NextResponse.json({ error: "Email is required for Connected and later stages" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !disqualificationReason) {
    return NextResponse.json({ error: "Disqualification reason is required for Not right now" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !whatNow) {
    return NextResponse.json({ error: "What now? is required for Not right now" }, { status: 400 });
  }
  if (email && store.contacts.some((c: any, i: number) => i !== idx && normalizeEmail(c.email) === email)) {
    return NextResponse.json({ error: "A contact with this email already exists" }, { status: 400 });
  }
  const previous = store.contacts[idx];
  const updated = { ...store.contacts[idx], ...body, status, email, disqualificationReason, whatNow, primaryPain: normalizePrimaryPain(body.primaryPain), updatedAt: now() };
  maybeCreateDealForDiscovery(store, updated);
  maybeCreateNurtureTaskForContact(store, previous, updated);
  syncContactStamp(store, previous, updated);
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
