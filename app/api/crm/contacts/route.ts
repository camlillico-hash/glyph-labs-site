import { NextResponse } from "next/server";
import {
  CONTACT_PIPELINES,
  CONTACT_STAGES,
  CONNECTOR_STAGES,
  ICP_STAGES,
  DEAL_STAGES,
  getStore,
  id,
  now,
  saveStore,
} from "@/lib/crm-store";


function normalizePipelineType(value: any) {
  const v = String(value || "").trim().toLowerCase();
  return (CONTACT_PIPELINES as readonly string[]).includes(v) ? v : "icp";
}

function mapContactStatus(value: string | undefined, pipelineType: string) {
  const v = String(value || "").trim();
  if (!v) return pipelineType === "connector" ? "Identified" : "New";
  if (v === "Discovery meeting booked") return "Warm intro booked";
  if (v === "Lost") return pipelineType === "connector" ? "Nurture" : "Closed Lost";
  return v;
}

function normalizeStatus(value: string | undefined, pipelineType: string) {
  const normalized = mapContactStatus(value, pipelineType);
  const allowed = pipelineType === "connector" ? CONNECTOR_STAGES : ICP_STAGES;
  return (allowed as readonly string[]).includes(normalized) ? normalized : (pipelineType === "connector" ? "Identified" : "New");
}

function normalizePrimaryPain(value: any) {
  const v = String(value || "").trim();
  return ["Execution", "Strategy", "Culture"].includes(v) ? v : undefined;
}

function normalizeLeadSource(value: any, pipelineType: string) {
  const v = String(value || "").trim();
  if (!v) return pipelineType === "connector" ? "Other" : undefined;
  const canonical = ["Connector", "Inbound", "Outbound", "Event", "Referral", "Other"].find((item) => item.toLowerCase() === v.toLowerCase());
  return canonical || v;
}

function normalizeEmail(value: any) {
  return String(value || "").trim().toLowerCase();
}

function statusNeedsEmail(status: string, pipelineType: string) {
  if (pipelineType === "connector") return ["Connected", "Positioned", "Activated", "Intro Pending", "Intro Delivered"].includes(status);
  return ["Connected", "Warm intro booked"].includes(status);
}

function normalizeDisqualificationReason(value: any) {
  const raw = String(value || "").trim();
  const v = raw.replace(/[’`]/g, "'");
  const allowed = ["Couldn't connect", "Went cold", "Said no", "Not the right person", "Shouldn't reach out just yet", "Done tapping network for now.", "Test Lead or Bad Data", "Other"];
  return allowed.includes(v) ? v : undefined;
}

function normalizeWhatNow(value: any) {
  const v = String(value || "").trim();
  return ["Leave them", "Nurture (future)"].includes(v) ? v : undefined;
}

function statusNeedsDisqualification(status: string) {
  return ["Nurture", "Closed Lost"].includes(status);
}

function plusMonthsIsoDate(baseIso: string, months: number) {
  const d = new Date(baseIso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function syncContactStamp(store: any, previous: any | null, contact: any) {
  const stamps = store.contactStamps || (store.contactStamps = []);
  const idx = stamps.findIndex((s: any) => s.contactId === contact.id);

  if (contact.pipelineType === "icp" && contact.status === "Warm intro booked") {
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

  const wasConverted = previous?.pipelineType === "icp" && previous?.status === "Warm intro booked";
  if (idx >= 0 && wasConverted) {
    store.contactStamps = stamps.filter((s: any) => s.contactId !== contact.id);
  }
}

function maybeCreateNurtureTaskForContact(store: any, previous: any | null, contact: any) {
  if (!["Nurture", "Closed Lost"].includes(contact.status)) return;
  if (contact.whatNow !== "Nurture (future)") return;

  const transitioned = !previous || previous.status !== contact.status || previous.whatNow !== "Nurture (future)";
  if (!transitioned) return;

  const existing = (store.tasks || []).some((t: any) =>
    t.followUpKind === "nurture_reactivate" &&
    t.followUpForContactId === contact.id &&
    t.status !== "Completed" && t.status !== "Canceled"
  );
  if (existing) return;

  (store.tasks || (store.tasks = [])).unshift({
    id: id(),
    title: contact.pipelineType === "connector" ? "Re-engage connector with a fresh ask" : "Check-in with a value-add nudge",
    type: contact.pipelineType === "connector" ? "linkedin" : "email",
    relatedType: "contact",
    relatedId: contact.id,
    followUpForContactId: contact.id,
    followUpKind: "nurture_reactivate",
    dueDate: plusMonthsIsoDate(now(), contact.pipelineType === "connector" ? 3 : 4),
    status: "Not started",
    done: false,
    notes: `Auto-created from ${contact.status} → Nurture (future).`,
    createdAt: now(),
    updatedAt: now(),
  });
}

function applyPipelineDefaults(contact: any) {
  if (contact.pipelineType === "connector") {
    contact.referralCount = Number(contact.referralCount || 0);
    if (contact.status === "Nurture" && !contact.nextReachOutAt) {
      contact.nextReachOutAt = plusMonthsIsoDate(now(), 6);
    }
  }
  return contact;
}

function maybeCreateIcpContactFromConnector(store: any, previous: any | null, contact: any) {
  if (contact.pipelineType !== "connector") return;
  if (contact.status !== "Intro Delivered") return;
  const transitioned = !previous || previous.status !== "Intro Delivered";
  if (!transitioned) return;

  const existing = (store.contacts || []).find((c: any) => c.pipelineType === "icp" && c.connectorContactId === contact.id);
  if (existing) return;

  const firstName = String(contact.firstName || "").trim();
  const lastName = String(contact.lastName || "").trim();
  const connectorName = `${firstName} ${lastName}`.trim() || contact.company || "Connector";

  store.contacts.unshift({
    id: id(),
    firstName: "",
    lastName: contact.company || "Intro target",
    email: "",
    phone: "",
    linkedin: "",
    company: "",
    title: "",
    type: "Decision maker",
    pipelineType: "icp",
    leadSource: "Connector",
    connectorContactId: contact.id,
    connectorName,
    introDate: now().slice(0, 10),
    primaryPain: normalizePrimaryPain(contact.primaryPain),
    status: "New",
    strengthTest: null,
    referralCount: 0,
    nextReachOutAt: undefined,
    seederNotes: `Auto-created from connector ${connectorName} after Intro Delivered.`,
    tags: [],
    notes: "",
    openBoardHidden: false,
    createdAt: now(),
    updatedAt: now(),
  });
}

function maybeCreateDealForWarmIntro(store: any, contact: any) {
  if (contact.pipelineType !== "icp") return;
  if (contact.status !== "Warm intro booked") return;
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
    clientStage: undefined,
    primaryPain: normalizePrimaryPain(contact.primaryPain),
    leadSource: contact.leadSource || "",
    connectorContactId: contact.connectorContactId || undefined,
    connectorName: contact.connectorName || undefined,
    introDate: contact.introDate || now().slice(0, 10),
    createdAt: now(),
    updatedAt: now(),
    nextStep: "Run warm intro meeting",
  });
}

function cleanupContactRelations(store: any, contactId: string) {
  store.contacts = (store.contacts || []).filter((c: any) => c.id !== contactId);
  store.contactStamps = (store.contactStamps || []).filter((s: any) => s.contactId !== contactId);
  store.activities = (store.activities || []).filter((a: any) => a.contactId !== contactId);
  store.tasks = (store.tasks || []).filter((t: any) => t.relatedId !== contactId && t.followUpForContactId !== contactId);
  store.deals = (store.deals || []).filter((d: any) => d.contactId !== contactId && d.connectorContactId !== contactId);
  store.dealStamps = (store.dealStamps || []).filter((s: any) => s.contactId !== contactId);
  store.strengthTests = (store.strengthTests || []).filter((s: any) => s.contactId !== contactId);
}

export async function GET() {
  const { resolveActiveAccountId } = await import("@/lib/crm-scope");
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
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
  if (!String(body.firstName || "").trim() && !String(body.lastName || "").trim()) {
    return NextResponse.json({ error: "A first or last name is required" }, { status: 400 });
  }

  const { resolveActiveAccountId } = await import("@/lib/crm-scope");
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  const pipelineType = normalizePipelineType(body.pipelineType);
  const status = normalizeStatus(body.status, pipelineType);
  const email = normalizeEmail(body.email);
  const disqualificationReason = normalizeDisqualificationReason(body.disqualificationReason);
  const whatNow = normalizeWhatNow(body.whatNow);
  if (statusNeedsEmail(status, pipelineType) && !email) {
    return NextResponse.json({ error: "Email is required for this stage" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !disqualificationReason) {
    return NextResponse.json({ error: "Disqualification reason is required for nurture/lost stages" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !whatNow) {
    return NextResponse.json({ error: "What now? is required for nurture/lost stages" }, { status: 400 });
  }
  if (email && store.contacts.some((c: any) => normalizeEmail(c.email) === email)) {
    return NextResponse.json({ error: "A contact with this email already exists" }, { status: 400 });
  }

  const record = {
    id: id(),
    createdAt: now(),
    updatedAt: now(),
    ...body,
    pipelineType,
    status,
    email,
    leadSource: normalizeLeadSource(body.leadSource, pipelineType),
    disqualificationReason,
    whatNow,
    connectorContactId: body.connectorContactId || undefined,
    connectorName: body.connectorName || undefined,
    introDate: body.introDate || undefined,
    referralCount: Number(body.referralCount || 0),
    nextReachOutAt: body.nextReachOutAt || undefined,
    seederNotes: body.seederNotes || undefined,
    primaryPain: normalizePrimaryPain(body.primaryPain),
    openBoardHidden: Boolean(body.openBoardHidden),
  };
  applyPipelineDefaults(record);
  maybeCreateIcpContactFromConnector(store, null, record);
  maybeCreateDealForWarmIntro(store, record);
  maybeCreateNurtureTaskForContact(store, null, record);
  syncContactStamp(store, null, record);
  store.contacts.unshift(record);
  await saveStore(store, accountId);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  if (!String(body.firstName || "").trim() && !String(body.lastName || "").trim()) {
    return NextResponse.json({ error: "A first or last name is required" }, { status: 400 });
  }

  const { resolveActiveAccountId } = await import("@/lib/crm-scope");
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  const idx = store.contacts.findIndex((c) => c.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const previous = store.contacts[idx];
  const pipelineType = normalizePipelineType(body.pipelineType || previous.pipelineType);
  const status = normalizeStatus(body.status, pipelineType);
  const email = normalizeEmail(body.email);
  const disqualificationReason = normalizeDisqualificationReason(body.disqualificationReason);
  const whatNow = normalizeWhatNow(body.whatNow);
  if (statusNeedsEmail(status, pipelineType) && !email) {
    return NextResponse.json({ error: "Email is required for this stage" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !disqualificationReason) {
    return NextResponse.json({ error: "Disqualification reason is required for nurture/lost stages" }, { status: 400 });
  }
  if (statusNeedsDisqualification(status) && !whatNow) {
    return NextResponse.json({ error: "What now? is required for nurture/lost stages" }, { status: 400 });
  }
  if (email && store.contacts.some((c: any, i: number) => i !== idx && normalizeEmail(c.email) === email)) {
    return NextResponse.json({ error: "A contact with this email already exists" }, { status: 400 });
  }

  const updated = {
    ...store.contacts[idx],
    ...body,
    pipelineType,
    status,
    email,
    leadSource: normalizeLeadSource(body.leadSource ?? previous.leadSource, pipelineType),
    disqualificationReason,
    whatNow,
    connectorContactId: body.connectorContactId || previous.connectorContactId || undefined,
    connectorName: body.connectorName || previous.connectorName || undefined,
    introDate: body.introDate || previous.introDate || undefined,
    referralCount: Number(body.referralCount || 0),
    nextReachOutAt: body.nextReachOutAt || undefined,
    seederNotes: body.seederNotes || undefined,
    primaryPain: normalizePrimaryPain(body.primaryPain),
    openBoardHidden: Boolean(body.openBoardHidden),
    updatedAt: now(),
  };
  applyPipelineDefaults(updated);
  maybeCreateIcpContactFromConnector(store, previous, updated);
  maybeCreateDealForWarmIntro(store, updated);
  maybeCreateNurtureTaskForContact(store, previous, updated);
  syncContactStamp(store, previous, updated);
  store.contacts[idx] = updated;

  await saveStore(store, accountId);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const stampId = searchParams.get("stampId");
    const { resolveActiveAccountId } = await import("@/lib/crm-scope");
    const accountId = await resolveActiveAccountId();
    const store = await getStore(accountId);

    if (stampId) {
      store.contactStamps = (store.contactStamps || []).filter((s: any) => s.id !== stampId);
      await saveStore(store, accountId);
      return NextResponse.json({ ok: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing contact id" }, { status: 400 });
    }

    const existed = (store.contacts || []).some((c: any) => c.id === id);
    if (!existed) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    cleanupContactRelations(store, id);
    await saveStore(store, accountId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not delete contact";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
