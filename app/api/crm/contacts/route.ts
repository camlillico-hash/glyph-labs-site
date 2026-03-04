import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";

export async function GET() {
  const store = await getStore();
  return NextResponse.json(store.contacts);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const store = await getStore();
  const record = { id: id(), createdAt: now(), updatedAt: now(), ...body };
  store.contacts.unshift(record);
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const store = await getStore();
  const idx = store.contacts.findIndex((c) => c.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.contacts[idx] = { ...store.contacts[idx], ...body, updatedAt: now() };
  await saveStore(store);
  return NextResponse.json(store.contacts[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const store = await getStore();
  store.contacts = store.contacts.filter((c) => c.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
