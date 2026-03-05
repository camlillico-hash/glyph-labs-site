import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";

const TASK_STATUSES = ["Not started", "Completed", "Canceled"] as const;

function normalizeStatus(body: any) {
  const v = String(body.status || "").trim();
  if ((TASK_STATUSES as readonly string[]).includes(v)) return v;
  if (body.done === true) return "Completed";
  return "Not started";
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
    type: "task_completed",
    note: `Task completed: ${task.title}${task.notes ? ` — ${task.notes}` : ""}`,
    occurredAt: now(),
    createdAt: now(),
    updatedAt: now(),
  };
  store.activities = [activity, ...(store.activities || [])];
  const cidx = (store.contacts || []).findIndex((c: any) => c.id === contactId);
  if (cidx >= 0) {
    store.contacts[cidx] = { ...store.contacts[cidx], lastActivityDate: activity.occurredAt, lastActivityType: "task_completed", updatedAt: now() };
  }
}

export async function GET() {
  const store = await getStore();
  return NextResponse.json({ tasks: store.tasks, statuses: TASK_STATUSES });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const store = await getStore();
  const error = validateTaskPayload(body, store);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const status = normalizeStatus(body);
  const record = { id: id(), createdAt: now(), updatedAt: now(), ...body, status, done: status === "Completed" };

  if (status === "Completed") {
    archiveTaskAsActivity(store, record);
    await saveStore(store);
    return NextResponse.json({ archived: true, record });
  }

  store.tasks.unshift(record);
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const store = await getStore();
  const idx = store.tasks.findIndex((t) => t.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const error = validateTaskPayload(body, store);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const status = normalizeStatus(body);
  const updated = { ...store.tasks[idx], ...body, status, done: status === "Completed", updatedAt: now() };

  if (status === "Completed") {
    archiveTaskAsActivity(store, updated);
    store.tasks = store.tasks.filter((t) => t.id !== updated.id);
    await saveStore(store);
    return NextResponse.json({ archived: true, record: updated });
  }

  store.tasks[idx] = updated;
  await saveStore(store);
  return NextResponse.json(store.tasks[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const store = await getStore();
  store.tasks = store.tasks.filter((t) => t.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
