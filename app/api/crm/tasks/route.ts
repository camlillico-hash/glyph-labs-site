import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";

export async function GET() {
  const store = await getStore();
  return NextResponse.json(store.tasks);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const store = await getStore();
  const record = { id: id(), createdAt: now(), updatedAt: now(), done: false, ...body };
  store.tasks.unshift(record);
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const store = await getStore();
  const idx = store.tasks.findIndex((t) => t.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.tasks[idx] = { ...store.tasks[idx], ...body, updatedAt: now() };
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
