import { NextResponse } from "next/server";
import { getStore, id, now, saveStore, CONNECTOR_STAGES, ICP_STAGES } from "@/lib/crm-store";
import { resolveActiveAccountId } from "@/lib/crm-scope";

const ALLOWED_TYPES = ["Influencer", "Decision maker", "Networker", "Other"];
const ALLOWED_PRIMARY_PAIN = ["Execution", "Strategy", "Culture"];
const LINKEDIN_ACTIVITY_DATE = "2026-04-01";
const LINKEDIN_ACTIVITY_NOTE = "Sent linkedin request";
const FILLABLE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "linkedin",
  "website",
  "company",
  "industry",
  "employeeSize",
  "areaGeo",
  "linkedinConnectRequest",
  "title",
  "type",
  "pipelineType",
  "leadSource",
  "primaryPain",
  "status",
  "notes",
] as const;

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

function normalizePipelineType(v: any) {
  const value = norm(v).toLowerCase();
  return value === "connector" ? "connector" : "icp";
}

function normalizeStatus(v: any, pipelineType: "connector" | "icp") {
  const raw = norm(v);
  if (!raw) return pipelineType === "connector" ? "Identified" : "New";

  const legacyMap: Record<string, string> = {
    "Pipeline Seeding": "Activated",
    "Pipeline Seeder": "Nurture",
    "Not right now": "Closed Lost",
    "Discovery meeting booked": "Warm intro booked",
  };
  const mapped = legacyMap[raw] || raw;
  const allowed = pipelineType === "connector" ? CONNECTOR_STAGES : ICP_STAGES;
  return (allowed as readonly string[]).includes(mapped) ? mapped : (pipelineType === "connector" ? "Identified" : "New");
}

function firstNonEmpty(r: any, keys: string[]) {
  for (const key of keys) {
    const value = norm(r?.[key]);
    if (value) return value;
  }
  return "";
}

function splitName(fullName: string) {
  const value = norm(fullName);
  if (!value) return { firstName: "", lastName: "" };
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1).join(""),
  };
}

function deriveNames(r: any) {
  const explicitFirst = firstNonEmpty(r, ["firstName", "First", "First name", "First Name", "first_name", "Given Name", "Given name"]);
  const explicitLast = firstNonEmpty(r, ["lastName", "Last", "Last name", "Last Name", "last_name", "Surname", "Family Name", "Family name"]);
  if (explicitFirst || explicitLast) {
    return { firstName: explicitFirst, lastName: explicitLast };
  }

  const combined = firstNonEmpty(r, ["contact", "Contact", "Full Name", "fullName", "Name", "name"]);
  return splitName(combined);
}

function buildNotes(r: any) {
  const parts = [
    firstNonEmpty(r, ["notes", "Notes"]),
    firstNonEmpty(r, ["Notes 1: Trigger", "Trigger", "trigger"]),
    firstNonEmpty(r, ["Notes 2: Why Now?", "Why Now", "whyNow", "why_now"]),
  ].filter(Boolean);
  return parts.join("\n\n");
}

function isYesValue(value: any) {
  const normalized = norm(value).toLowerCase();
  return ["y", "yes", "true", "1"].includes(normalized);
}

function parseRow(r: any) {
  const { firstName, lastName } = deriveNames(r);
  const pipelineType = normalizePipelineType(r.pipelineType || r["Pipeline type"] || r.pipeline || r.Pipeline || "icp");
  const status = normalizeStatus(r.status || r["Lead Status"] || r.Stage || r.stage, pipelineType);
  const type = norm(r.type || r.Type);
  const primaryPain = norm(r.primaryPain || r["Primary pain"] || r["Primary Pain"]);

  return {
    contactId: firstNonEmpty(r, ["contactId", "Contact ID", "ContactId"]),
    firstName,
    lastName,
    email: firstNonEmpty(r, ["email", "Email", "Email Address"]),
    normalizedEmail: firstNonEmpty(r, ["email", "Email", "Email Address"]).toLowerCase(),
    phone: formatPhone(firstNonEmpty(r, ["phone", "Phone"])),
    linkedin: firstNonEmpty(r, ["linkedin", "Linkedin", "LinkedIn", "linkedin_url", "LinkedIn Profile"]),
    website: firstNonEmpty(r, ["website", "Website"]),
    company: firstNonEmpty(r, ["company", "Company"]),
    industry: firstNonEmpty(r, ["industry", "Industry"]),
    employeeSize: firstNonEmpty(r, ["employeeSize", "Employee Size", "Employees"]),
    areaGeo: firstNonEmpty(r, ["areaGeo", "Area/Geo", "Area", "Geo"]),
    linkedinConnectRequest: firstNonEmpty(r, ["linkedinConnectRequest", "Linkedin Connect Request", "LinkedIn Connect Request"]),
    title: firstNonEmpty(r, ["title", "Title"]),
    type: ALLOWED_TYPES.includes(type) ? type : "",
    pipelineType,
    leadSource: firstNonEmpty(r, ["leadSource", "Lead source", "Lead Source", "source", "Source"]),
    primaryPain: ALLOWED_PRIMARY_PAIN.includes(primaryPain) ? primaryPain : undefined,
    status,
    notes: buildNotes(r),
  };
}

function fillMissing(existing: any, incoming: any) {
  const updated = { ...existing };
  for (const field of FILLABLE_FIELDS) {
    const currentValue = updated[field];
    const incomingValue = incoming[field];
    const currentEmpty = currentValue === undefined || currentValue === null || String(currentValue).trim() === "";
    const incomingEmpty = incomingValue === undefined || incomingValue === null || String(incomingValue).trim() === "";
    if (currentEmpty && !incomingEmpty) {
      updated[field] = incomingValue;
    }
  }
  return updated;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  if (!rows.length) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  const contacts = store.contacts || [];
  const existingEmails = new Map<string, any>();
  contacts.forEach((contact: any) => {
    const email = norm(contact.email).toLowerCase();
    if (email) existingEmails.set(email, contact);
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  rows.forEach((r: any, idx: number) => {
    const parsed = parseRow(r);
    if (!parsed.firstName || !parsed.lastName) {
      skipped++; errors.push({ row: idx + 1, reason: "Missing firstName/lastName" }); return;
    }

    if (parsed.contactId) {
      const existingIdx = contacts.findIndex((c: any) => c.id === parsed.contactId);
      if (existingIdx < 0) {
        skipped++; errors.push({ row: idx + 1, reason: `Unknown contactId: ${parsed.contactId}` }); return;
      }

      const existing = contacts[existingIdx];
      if (parsed.normalizedEmail) {
        const owner = existingEmails.get(parsed.normalizedEmail);
        if (owner && owner.id !== existing.id) {
          skipped++; errors.push({ row: idx + 1, reason: "Email belongs to another contact" }); return;
        }
      }

      const merged = fillMissing(existing, parsed);
      merged.updatedAt = now();
      contacts[existingIdx] = merged;
      if (parsed.normalizedEmail) existingEmails.set(parsed.normalizedEmail, merged);
      updated++;
      return;
    }

    if (parsed.normalizedEmail && existingEmails.has(parsed.normalizedEmail)) {
      skipped++; errors.push({ row: idx + 1, reason: "Duplicate email" }); return;
    }

    const contact: any = {
      id: id(),
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      linkedin: parsed.linkedin,
      website: parsed.website,
      company: parsed.company,
      industry: parsed.industry,
      employeeSize: parsed.employeeSize,
      areaGeo: parsed.areaGeo,
      linkedinConnectRequest: parsed.linkedinConnectRequest,
      title: parsed.title,
      type: parsed.type,
      pipelineType: parsed.pipelineType,
      leadSource: parsed.leadSource,
      primaryPain: parsed.primaryPain,
      status: parsed.status,
      notes: parsed.notes,
      createdAt: now(),
      updatedAt: now(),
    };

    contacts.unshift(contact);
    if (isYesValue(contact.linkedinConnectRequest)) {
      const activity: any = {
        id: id(),
        contactId: contact.id,
        type: "linkedin",
        note: LINKEDIN_ACTIVITY_NOTE,
        occurredAt: LINKEDIN_ACTIVITY_DATE,
        createdAt: now(),
        updatedAt: now(),
      };
      store.activities = [activity, ...((store.activities as any) || [])];
      contact.lastActivityDate = activity.occurredAt;
      contact.lastActivityType = activity.type;
      if (contact.status === "New") {
        contact.status = "Attempting";
      }
      contact.updatedAt = now();
    }
    if (parsed.normalizedEmail) existingEmails.set(parsed.normalizedEmail, contact);
    created++;
  });

  store.contacts = contacts;
  await saveStore(store, accountId);
  return NextResponse.json({ ok: true, created, updated, skipped, errors: errors.slice(0, 50) });
}
