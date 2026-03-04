import { NextResponse } from "next/server";
import { DEAL_STAGES, getStore, id, now, saveStore } from "@/lib/crm-store";

export async function GET() {
  const store = await getStore();
  return NextResponse.json({ deals: store.deals, stages: DEAL_STAGES });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const store = await getStore();
  const record = { id: id(), createdAt: now(), updatedAt: now(), stage: DEAL_STAGES[0], ...body };
  store.deals.unshift(record);
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const store = await getStore();
  const idx = store.deals.findIndex((d) => d.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.deals[idx] = { ...store.deals[idx], ...body, updatedAt: now() };
  await saveStore(store);
  return NextResponse.json(store.deals[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const store = await getStore();
  store.deals = store.deals.filter((d) => d.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
