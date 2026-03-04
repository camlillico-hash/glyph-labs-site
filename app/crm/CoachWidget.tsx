"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function CoachWidget() {
  const [data, setData] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <>
      {/* Desktop: inline header coach panel */}
      <div className="mx-4 hidden min-w-0 flex-1 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 py-2 md:flex">
        <img src={data.avatar} alt="Glyphy avatar" className="h-[65px] w-[65px] shrink-0 rounded-xl border border-neutral-700 object-cover" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }}>{data.name}</p>
          <p className="truncate text-sm text-slate-200">{data.message}</p>
        </div>
      </div>

      {/* Mobile: bottom-right coach bubble */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="h-16 w-16 overflow-hidden rounded-full border-2 border-neutral-600 shadow-2xl"
          aria-label="Toggle Sales Coach Glyphy"
        >
          <img src={data.avatar} alt="Glyphy avatar" className="h-full w-full object-cover" />
        </button>

        {mobileOpen && (
          <div className="mt-2 w-[78vw] max-w-[320px] rounded-xl border border-neutral-700 bg-neutral-950/95 p-3 shadow-2xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }}>{data.name}</p>
              <button className="text-slate-300" onClick={() => setMobileOpen(false)}>
                {mobileOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
            <p className="text-sm text-slate-200">{data.message}</p>
          </div>
        )}
      </div>
    </>
  );
}
