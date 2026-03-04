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
    <div className="mx-4 hidden min-w-0 flex-1 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 py-2 md:flex">
      <img src={data.avatar} alt="Glyphy avatar" className="h-[100px] w-[100px] shrink-0 rounded-xl border border-neutral-700 object-cover" />
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-wider text-emerald-300">{data.name}</p>
        <p className="truncate text-sm text-slate-200">{data.message}</p>
      </div>
    </div>
  );
}
