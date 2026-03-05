import { NextResponse } from "next/server";
import { DEAL_STAGES, DEAL_STAGE_WEIGHTS, getStore, id, now, saveStore } from "@/lib/crm-store";

function upsertDealStamp(store: any, deal: any) {
  if (deal.stage !== "Launch paid (won)") return;
  const idx = (store.dealStamps || []).findIndex((s: any) => s.dealId === deal.id);
  const stamp = {
    id: idx >= 0 ? store.dealStamps[idx].id : id(),
    dealId: deal.id,
    name: deal.name || "Untitled deal",
    company: deal.company || "",
    contactId: deal.contactId || "",
    value: Number(deal.value || 0),
    wonAt: idx >= 0 ? store.dealStamps[idx].wonAt : now(),
    removedAt: undefined,
  };
  if (idx >= 0) store.dealStamps[idx] = stamp;
  else store.dealStamps = [stamp, ...(store.dealStamps || [])];
}

function normalizeStage(value: any) {
  const legacyMap: Record<string, string> = {
    "90-minute booked": "Fit meeting booked",
    "90-minute complete": "Fit meeting completed",
    "Verbal Yes": "Proposal / commitment",
    "Client signed (won)": "Launch paid (won)",
  };
  const v = legacyMap[String(value || "").trim()] || String(value || "").trim();
  if (!v) return DEAL_STAGES[0];
  return (DEAL_STAGES as readonly string[]).includes(v) ? v : DEAL_STAGES[0];
}

function normalizePrimaryPain(value: any) {
  const v = String(value || "").trim();
  return ["Execution", "Strategy", "Culture"].includes(v) ? v : undefined;
}

function normalizeClientStage(stage: string, clientStage: any) {
  if (stage !== "Launch paid (won)") return undefined;
  const v = String(clientStage || "").trim();
  if (v === "Launch" || v === "Active rhythm") return v;
  return "Launch";
}

function computeFinancials(input: any) {
  const dailyRate = Number(input.dailyRate || 5000);
  const launchFee = dailyRate * 3;
  const annualFee = dailyRate * 5;
  const amount = launchFee + annualFee;
  return { dailyRate, launchFee, annualFee, value: amount };
}

export async function GET() {
  const store = await getStore();
  return NextResponse.json({ deals: store.deals, dealStamps: store.dealStamps || [], stages: DEAL_STAGES });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!String(body.name || "").trim()) {
    return NextResponse.json({ error: "Deal name is required" }, { status: 400 });
  }
  if (!String(body.contactId || "").trim()) {
    return NextResponse.json({ error: "Linked contact is required" }, { status: 400 });
  }
  const store = await getStore();
  const stage = normalizeStage(body.stage || DEAL_STAGES[0]);
  const financials = computeFinancials(body);
  const record = {
    id: id(),
    createdAt: now(),
    updatedAt: now(),
    ...body,
    ...financials,
    stage,
    probability: DEAL_STAGE_WEIGHTS[stage] ?? 0,
    primaryPain: normalizePrimaryPain(body.primaryPain),
    clientStage: normalizeClientStage(stage, body.clientStage),
  };
  store.deals.unshift(record);
  upsertDealStamp(store, record);
  await saveStore(store);
  return NextResponse.json(record);
}

export async function PUT(req: Request) {
  const body = await req.json();
  if (!String(body.name || "").trim()) {
    return NextResponse.json({ error: "Deal name is required" }, { status: 400 });
  }
  if (!String(body.contactId || "").trim()) {
    return NextResponse.json({ error: "Linked contact is required" }, { status: 400 });
  }
  const store = await getStore();
  const idx = store.deals.findIndex((d) => d.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const stage = normalizeStage(body.stage || store.deals[idx].stage);
  const financials = computeFinancials({ ...store.deals[idx], ...body });
  store.deals[idx] = {
    ...store.deals[idx],
    ...body,
    ...financials,
    stage,
    probability: DEAL_STAGE_WEIGHTS[stage] ?? 0,
    primaryPain: normalizePrimaryPain(body.primaryPain),
    clientStage: normalizeClientStage(stage, body.clientStage ?? store.deals[idx].clientStage),
    updatedAt: now(),
  };
  upsertDealStamp(store, store.deals[idx]);
  await saveStore(store);
  return NextResponse.json(store.deals[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const stampId = searchParams.get("stampId");
  const store = await getStore();

  if (stampId) {
    store.dealStamps = (store.dealStamps || []).filter((s: any) => s.id !== stampId);
    await saveStore(store);
    return NextResponse.json({ ok: true });
  }

  store.deals = store.deals.filter((d) => d.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
