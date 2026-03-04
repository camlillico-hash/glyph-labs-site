import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";

const TYPES = ["email", "call", "text", "linkedin", "in_person", "meeting", "task_completed"] as const;

function normalizeType(v: any) {
  const t = String(v || "").trim().toLowerCase();
  return (TYPES as readonly string[]).includes(t) ? t : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");
  const store = await getStore();
  let activities = store.activities || [];
  if (contactId) activities = activities.filter((a: any) => a.contactId === contactId);
  activities = [...activities].sort((a: any, b: any) => new Date(b.occurredAt || b.createdAt).getTime() - new Date(a.occurredAt || a.createdAt).getTime());
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const store = await getStore();
  const type = normalizeType(body.type);
  if (!type) return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
  if (!String(body.contactId || "").trim()) return NextResponse.json({ error: "contactId is required" }, { status: 400 });
  const exists = store.contacts.some((c: any) => c.id === body.contactId);
  if (!exists) return NextResponse.json({ error: "Contact not found" }, { status: 400 });

  const record: any = {
    id: id(),
    contactId: body.contactId,
    type,
    note: body.note || "",
    occurredAt: body.occurredAt || now(),
    createdAt: now(),
    updatedAt: now(),
  };
  store.activities = [record as any, ...((store.activities as any) || [])] as any;
  const cidx = store.contacts.findIndex((c: any) => c.id === record.contactId);
  if (cidx >= 0) {
    store.contacts[cidx] = { ...store.contacts[cidx], lastActivityDate: record.occurredAt, lastActivityType: record.type, updatedAt: now() };
  }
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const store = await getStore();
  const idx = (store.activities || []).findIndex((a: any) => a.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const type = normalizeType(body.type);
  if (!type) return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
  if (!String(body.contactId || "").trim()) return NextResponse.json({ error: "contactId is required" }, { status: 400 });

  (store.activities as any)[idx] = {
    ...store.activities[idx],
    ...body,
    type,
    updatedAt: now(),
  };
  const cidx2 = store.contacts.findIndex((c: any) => c.id === (store.activities as any)[idx].contactId);
  if (cidx2 >= 0) {
    store.contacts[cidx2] = { ...store.contacts[cidx2], lastActivityDate: (store.activities as any)[idx].occurredAt, lastActivityType: (store.activities as any)[idx].type, updatedAt: now() };
  }
  await saveStore(store);
  return NextResponse.json((store.activities as any)[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("id");
  const store = await getStore();
  store.activities = (store.activities || []).filter((a: any) => a.id !== activityId);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
