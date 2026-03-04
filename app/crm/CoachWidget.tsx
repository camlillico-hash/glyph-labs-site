"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CoachWidget() {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const res = await fetch("/api/crm/coach", { cache: "no-store" });
      const j = await res.json();
      if (mounted) setData(j);
    };
    run();
    const t = setInterval(run, 60000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  if (!data) return null;

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-[340px] max-w-[92vw] rounded-2xl border border-neutral-700 bg-neutral-950/95 shadow-2xl backdrop-blur">
      <button
        className="flex w-full items-center justify-between border-b border-neutral-800 px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex items-center gap-2 font-semibold text-slate-100">
          <img src={data.avatar} alt="Glyphord avatar" className="h-8 w-8 rounded-lg border border-neutral-700" />
          {data.name} · {data.title}
        </span>
        {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {open && (
        <div className="space-y-3 p-3">
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-slate-200">
            {data.message}
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Stat label="Contacts" value={data.stats.contacts} />
            <Stat label="Open deals" value={data.stats.openDeals} />
            <Stat label="Overdue" value={data.stats.overdueTasks} warn />
          </div>
        </div>
      )}
    </aside>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-base font-semibold ${warn && value > 0 ? "text-amber-300" : "text-slate-100"}`}>{value}</p>
    </div>
  );
}
