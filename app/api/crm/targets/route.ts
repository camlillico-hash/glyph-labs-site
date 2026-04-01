import { NextResponse } from "next/server";
import { defaultTargets, getStore, normalizeTransitionTargets, saveStore } from "@/lib/crm-store";
import { resolveActiveAccountId } from "@/lib/crm-scope";

const numericKeys = [
  "revenueGoalAnnual",
  "avgRevenuePerClientAnnual",
  "convConnectorActivatedToIntroDelivered",
  "convLeadToWarmIntro",
  "convWarmIntroToDiscovery",
  "convDiscoveryToLaunch",
] as const;

const legacyKeyMap: Record<string, string> = {
  convActivatedToIntroDelivered: "convConnectorActivatedToIntroDelivered",
  convIntroDeliveredToWarmIntroBooked: "convLeadToWarmIntro",
  convWarmIntroBookedToWon: "convWarmIntroToDiscovery",
};

export async function GET() {
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  return NextResponse.json({
    targets: normalizeTransitionTargets({ ...defaultTargets, ...(store.targets || {}) }),
    targetsHistory: store.targetsHistory || [],
  });
}

export async function POST(req: Request) {
  const accountId = await resolveActiveAccountId();
  try {
    const form = await req.formData();
    const store = await getStore(accountId);
    const previous = normalizeTransitionTargets({ ...defaultTargets, ...(store.targets || {}) }) as Record<string, any>;
    const next = { ...previous } as Record<string, any>;

    for (const key of numericKeys) {
      const raw = String(form.get(key) ?? "").trim();
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0) next[key] = parsed;
    }

    for (const [legacyKey, nextKey] of Object.entries(legacyKeyMap)) {
      if (form.has(nextKey)) continue;
      const raw = String(form.get(legacyKey) ?? "").trim();
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0) next[nextKey] = parsed;
    }

    const targetDateRaw = String(form.get("targetDate") ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(targetDateRaw)) next.targetDate = targetDateRaw;

    const normalizedNext = normalizeTransitionTargets(next) as Record<string, any>;
    const changedFields = Object.keys(normalizedNext).filter((k) => String(previous[k]) !== String(normalizedNext[k]));

    store.targets = normalizedNext as any;
    if (changedFields.length > 0) {
      const history = Array.isArray(store.targetsHistory) ? store.targetsHistory : [];
      history.unshift({
        changedAt: new Date().toISOString(),
        changedFields,
        before: Object.fromEntries(changedFields.map((k) => [k, previous[k]])),
        after: Object.fromEntries(changedFields.map((k) => [k, normalizedNext[k]])),
      });
      store.targetsHistory = history.slice(0, 50);
    }

    await saveStore(store, accountId);

    return NextResponse.redirect(new URL("/crm/settings?targets=saved", req.url), 303);
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/crm/settings?targets=error&reason=${encodeURIComponent(e?.message || "save_failed")}`, req.url), 303);
  }
}
