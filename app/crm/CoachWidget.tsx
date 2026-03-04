"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Flame, Hammer, Heart } from "lucide-react";

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

  const Icon = data.icon === "flame" ? Flame : data.icon === "heart" ? Heart : Hammer;
  const iconClass = data.iconColor === "red"
    ? "bg-rose-600/20 text-rose-300 border-rose-500/40"
    : data.iconColor === "green"
      ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
      : "bg-sky-600/20 text-sky-300 border-sky-500/40";

  return (
    <>
      {/* Desktop */}
      <div className="mx-4 hidden min-w-0 flex-1 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 py-2 md:flex">
        <img src={data.avatar} alt="Glyphy avatar" className="h-[65px] w-[65px] shrink-0 rounded-xl border border-neutral-700 object-cover" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }}>{data.name}</p>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${iconClass}`}>
              <Icon size={12} /> {data.statusLabel}
            </span>
          </div>
          <p className="truncate text-sm text-slate-200">{data.message}</p>
        </div>
      </div>

      {/* Mobile bubble */}
      <div
        className="fixed z-50 md:hidden"
        style={{ right: "1rem", bottom: "max(1rem, env(safe-area-inset-bottom))", top: "auto", left: "auto" }}
      >
        <button onClick={() => setMobileOpen((v) => !v)} className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-neutral-600 shadow-2xl" aria-label="Toggle Sales Coach Glyphy">
          <img src={data.avatar} alt="Glyphy avatar" className="h-full w-full object-cover" />
          <span className={`absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${iconClass}`}>
            <Icon size={12} />
          </span>
        </button>

        {mobileOpen && (
          <div className="absolute bottom-[76px] right-0 w-[78vw] max-w-[330px] rounded-xl border border-neutral-700 bg-neutral-950/95 p-3 shadow-2xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between" onClick={() => setMobileOpen(false)}>
              <p className="text-base font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }}>{data.name}</p>
              <button className="text-slate-300" onClick={() => setMobileOpen(false)}>
                {mobileOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
            <p className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${iconClass}`}>
              <Icon size={12} /> {data.statusLabel}
            </p>
            <p className="text-sm text-slate-200">{data.message}</p>
          </div>
        )}
      </div>
    </>
  );
}
