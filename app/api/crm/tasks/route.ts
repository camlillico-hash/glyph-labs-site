import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";

const TASK_STATUSES = ["Not started", "Completed", "Canceled"] as const;
const TASK_TYPES = ["email", "call", "text", "linkedin", "in_person", "meeting", "to_do", "task_completed"] as const;

function normalizeStatus(body: any) {
  const v = String(body.status || "").trim();
  if ((TASK_STATUSES as readonly string[]).includes(v)) return v;
  if (body.done === true) return "Completed";
  return "Not started";
}

function normalizeType(body: any) {
  const v = String(body.type || "").trim();
  return (TASK_TYPES as readonly string[]).includes(v) ? v : "meeting";
}

function validateTaskPayload(body: any, store: any) {
  if (!String(body.title || "").trim()) return "Task title is required";
  if (body.relatedType !== "contact" && body.relatedType !== "deal") return "Tasks must be associated to a contact or deal";
  if (!String(body.relatedId || "").trim()) return body.relatedType === "deal" ? "Linked deal is required" : "Linked contact is required";
  if (body.relatedType === "deal") {
    const dealExists = store.deals.some((d: any) => d.id === body.relatedId);
    if (!dealExists) return "Linked deal not found";
    return null;
  }
  const contactExists = store.contacts.some((c: any) => c.id === body.relatedId);
  if (!contactExists) return "Linked contact not found";
  return null;
}

function archiveTaskAsActivity(store: any, task: any) {
  const contactId = task.relatedType === "deal"
    ? (store.deals.find((d: any) => d.id === task.relatedId)?.contactId || "")
    : task.relatedId;
  if (!contactId) return;

  const activity = {
    id: id(),
    contactId,
    type: (task.type && (TASK_TYPES as readonly string[]).includes(task.type) ? task.type : "task_completed"),
    note: `Task completed: ${task.title}${task.notes ? ` — ${task.notes}` : ""}`,
    occurredAt: now(),
    createdAt: now(),
    updatedAt: now(),
  };
  store.activities = [activity, ...(store.activities || [])];
  const cidx = (store.contacts || []).findIndex((c: any) => c.id === contactId);
  if (cidx >= 0) {
    const currentStatus = store.contacts[cidx].status || "New";
    store.contacts[cidx] = {
      ...store.contacts[cidx],
      status: currentStatus === "New" ? "Attempting" : currentStatus,
      lastActivityDate: activity.occurredAt,
      lastActivityType: activity.type,
      updatedAt: now(),
    };
  }
}

export async function GET() {
  const { resolveActiveAccountId } = await import("@/lib/crm-scope");
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  let changed = false;

  for (const t of (store.tasks || [])) {
    if (t.followUpKind !== "nurture_reactivate" || !t.followUpForContactId || !t.dueDate) continue;
    if (t.status === "Completed" || t.status === "Canceled") continue;
    const dueMs = new Date(`${t.dueDate}T23:59:59`).getTime();
    if (Number.isNaN(dueMs) || dueMs > todayEnd.getTime()) continue;

    const cidx = (store.contacts || []).findIndex((c: any) => c.id === t.followUpForContactId);
    if (cidx >= 0) {
      store.contacts[cidx] = {
        ...store.contacts[cidx],
        status: store.contacts[cidx].pipelineType === "connector" ? "Identified" : "New",
        updatedAt: now(),
      };
      changed = true;
    }

    t.status = "Canceled";
    t.notes = `${t.notes ? `${t.notes}\n` : ""}Auto: contact reset to New when nurture follow-up became due.`;
    t.updatedAt = now();
    changed = true;
  }

  if (changed) await saveStore(store, accountId);
  return NextResponse.json({ tasks: store.tasks, statuses: TASK_STATUSES });
}

export async function POST(req: Request) {
  const { resolveActiveAccountId } = await import("@/lib/crm-scope");
  const accountId = await resolveActiveAccountId();

  const body = await req.json().catch(() => ({}));
  const store = await getStore(accountId);
  const error = validateTaskPayload(body, store);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const status = normalizeStatus(body);
  const record = { id: id(), createdAt: now(), updatedAt: now(), ...body, type: normalizeType(body), status, done: status === "Completed" };

  if (status === "Completed") {
    archiveTaskAsActivity(store, record);
    await saveStore(store, accountId);
    return NextResponse.json({ archived: true, record });
  }

  store.tasks.unshift(record);
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const { resolveActiveAccountId } = await import("@/lib/crm-scope");
  const accountId = await resolveActiveAccountId();

  const body = await req.json();
  const store = await getStore(accountId);
  const idx = store.tasks.findIndex((t) => t.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const error = validateTaskPayload(body, store);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const status = normalizeStatus(body);
  const updated = { ...store.tasks[idx], ...body, type: normalizeType(body), status, done: status === "Completed", updatedAt: now() };

  if (status === "Completed") {
    archiveTaskAsActivity(store, updated);
    store.tasks = store.tasks.filter((t) => t.id !== updated.id);
    await saveStore(store, accountId);
    return NextResponse.json({ archived: true, record: updated });
  }

  store.tasks[idx] = updated;
  await saveStore(store);
  return NextResponse.json(store.tasks[idx]);
}

export async function DELETE(req: Request) {
  const { resolveActiveAccountId } = await import("@/lib/crm-scope");
  const accountId = await resolveActiveAccountId();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const store = await getStore(accountId);
  store.tasks = store.tasks.filter((t) => t.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
