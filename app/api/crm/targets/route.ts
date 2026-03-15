import { NextResponse } from "next/server";
import { defaultTargets, getStore, saveStore } from "@/lib/crm-store";

const numericKeys = Object.keys(defaultTargets) as Array<keyof typeof defaultTargets>;

export async function GET() {
  const store = await getStore();
  return NextResponse.json({ targets: { ...defaultTargets, ...(store.targets || {}) } });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const store = await getStore();
    const next = { ...defaultTargets, ...(store.targets || {}) } as Record<string, number>;

    for (const key of numericKeys) {
      const raw = String(form.get(key as string) ?? "").trim();
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0) next[key] = parsed;
    }

    store.targets = next as any;
    await saveStore(store);

    return NextResponse.redirect(new URL("/crm/settings?targets=saved", req.url), 303);
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/crm/settings?targets=error&reason=${encodeURIComponent(e?.message || "save_failed")}`, req.url), 303);
  }
}
