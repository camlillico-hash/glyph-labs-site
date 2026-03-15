"use client";

import { useMemo, useState } from "react";

type KpiRecord = {
  id: string;
  name: string;
  status: string;
};

type KpiItem = {
  key: string;
  label: string;
  value: number | string;
  target?: string;
  ok?: boolean;
  records: KpiRecord[];
};

export default function KpiScoreboard({ items }: { items: KpiItem[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = useMemo(() => items.find((i) => i.key === activeKey) || null, [items, activeKey]);

  return (
    <>
      <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`rounded-lg border px-3 py-2 text-left transition hover:-translate-y-0.5 ${item.ok === undefined ? "border-neutral-700 bg-neutral-900/70 hover:border-neutral-500" : item.ok ? "border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400/60" : "border-rose-500/40 bg-rose-500/10 hover:border-rose-400/60"}`}
            onClick={() => setActiveKey(item.key)}
          >
            <p className="text-xs text-slate-300">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">{item.value} {item.target ? <span className="text-xs font-normal text-slate-400">(target {item.target})</span> : null}</p>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActiveKey(null)} />
          <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-700 bg-neutral-950 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-100">{active.label} — contributing records</h3>
              <button className="crm-btn-ghost" onClick={() => setActiveKey(null)}>Close</button>
            </div>

            {active.records.length === 0 ? (
              <p className="text-sm text-slate-400">No records matched this KPI in the current window.</p>
            ) : (
              <ul className="max-h-[60vh] space-y-2 overflow-auto">
                {active.records.map((r) => (
                  <li key={r.id} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">
                    <p className="font-medium text-slate-100">{r.name}</p>
                    <p className="text-xs text-slate-400">Status: {r.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
