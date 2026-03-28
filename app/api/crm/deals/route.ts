import { NextResponse } from "next/server";
import { DEAL_STAGES, DEAL_STAGE_WEIGHTS, getStore, id, now, saveStore } from "@/lib/crm-store";
import { resolveActiveAccountId } from "@/lib/crm-scope";

function upsertDealStamp(store: any, deal: any) {
  if (!["Launch days paid", "Launch paid (won)"].includes(deal.stage)) return;
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
    "Client signed (won)": "Launch days paid",
    "Discovery meeting booked": "Warm intro booked",
    "Discovery meeting completed": "Warm intro completed",
    "Fit meeting booked": "90-min disco booked",
    "Fit meeting completed": "90-min disco completed",
    "Launch paid (won)": "Launch days paid",
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
  if (!["Launch days paid", "Launch paid (won)"].includes(stage)) return undefined;
  const v = String(clientStage || "").trim();
  if (v === "Launch" || v === "Active rhythm") return v;
  return "Launch";
}

function computeFinancials(input: any) {
  const launchIncluded = String(input.launchIncluded || "Yes") === "No" ? "No" : "Yes";
  const dailyRate = Number(input.dailyRate || 5000);
  const launchFee = launchIncluded === "Yes" ? dailyRate * 3 : 0;
  const annualFee = dailyRate * 5;
  const amount = launchFee + annualFee;
  return { launchIncluded, dailyRate, launchFee, annualFee, value: amount };
}

export async function GET() {
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  return NextResponse.json({ deals: store.deals, dealStamps: store.dealStamps || [], stages: DEAL_STAGES });
}

export async function POST() {
  return NextResponse.json({ error: "Direct deal creation is disabled. Move a contact to Warm intro booked to create a deal." }, { status: 403 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  if (!String(body.name || "").trim()) {
    return NextResponse.json({ error: "Deal name is required" }, { status: 400 });
  }
  if (!String(body.contactId || "").trim()) {
    return NextResponse.json({ error: "Linked contact is required" }, { status: 400 });
  }
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
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
  await saveStore(store, accountId);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const stampId = searchParams.get("stampId");
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  if (stampId) {
    store.dealStamps = (store.dealStamps || []).filter((s: any) => s.id !== stampId);
    await saveStore(store, accountId);
    return NextResponse.json({ ok: true });
  }

  store.deals = store.deals.filter((d) => d.id !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
