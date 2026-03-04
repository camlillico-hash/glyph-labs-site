"use client";

import { useEffect, useState } from "react";

export default function CoachWidget() {
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
    <div className="mx-4 hidden min-w-0 flex-1 items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2 py-1.5 md:flex">
      <img src={data.avatar} alt="Glyphy avatar" className="h-8 w-8 shrink-0 rounded-lg border border-neutral-700" />
      <div className="min-w-0">
        <p className="truncate text-[11px] uppercase tracking-wider text-emerald-300">{data.name}</p>
        <p className="truncate text-xs text-slate-300">{data.message}</p>
      </div>
    </div>
  );
}
