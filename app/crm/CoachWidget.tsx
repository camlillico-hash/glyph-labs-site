"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Flame, Hammer, Heart } from "lucide-react";

export default function CoachWidget({ mode = "desktop-inline" }: { mode?: "desktop-inline" | "mobile-accordion" }) {
  const [data, setData] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const [desktopCanExpand, setDesktopCanExpand] = useState(false);
  const desktopMsgRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const res = await fetch("/api/crm/coach", { cache: "no-store" });
      const j = await res.json();
      if (mounted) setData(j);
    };
    run();
    const t = setInterval(run, 60000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = desktopMsgRef.current;
      if (!el) return;
      const over = el.scrollHeight > el.clientHeight + 1;
      setDesktopCanExpand(over);
      if (!over) setDesktopExpanded(false);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [data?.message, desktopExpanded]);

  if (!data) return null;

  const Icon = data.icon === "flame" ? Flame : data.icon === "heart" ? Heart : Hammer;
  const iconClass =
    data.iconColor === "red"
      ? "bg-rose-600/20 text-rose-300 border-rose-500/40"
      : data.iconColor === "green"
        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
        : "bg-sky-600/20 text-sky-300 border-sky-500/40";

  if (mode === "mobile-accordion") {
    return (
      <div className="mt-2 w-full md:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900/85 px-3 py-2"
          aria-label="Toggle Sales Sgt. Glyphy"
        >
          <span className="inline-flex items-center gap-2">
            <img src={data.avatar} alt="Glyphy avatar" className="h-10 w-10 rounded-full border border-neutral-700 object-cover" />
            <span>
              <p className="text-base font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }}>
                {data.name}
              </p>
              <p className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${iconClass}`}>
                <Icon size={11} /> {data.statusLabel}
              </p>
            </span>
          </span>
          {mobileOpen ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
        </button>

        {mobileOpen && (
          <div className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950/95 p-3">
            <p className="text-sm text-slate-200">{data.message}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-4 hidden min-w-0 flex-1 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 py-2 md:flex">
      <img src={data.avatar} alt="Glyphy avatar" className="h-[65px] w-[65px] shrink-0 rounded-xl border border-neutral-700 object-cover" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-lg font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }}>
            {data.name}
          </p>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${iconClass}`}>
            <Icon size={12} /> {data.statusLabel}
          </span>
        </div>
        <div className="flex items-start gap-1">
          <p
            ref={desktopMsgRef}
            className="text-sm text-slate-200"
            style={desktopExpanded ? undefined : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {data.message}
          </p>
          {desktopCanExpand && (
            <button
              type="button"
              className="mt-0.5 rounded p-0.5 text-slate-300 hover:bg-neutral-800"
              onClick={() => setDesktopExpanded((v) => !v)}
              aria-label={desktopExpanded ? "Collapse message" : "Expand message"}
            >
              {desktopExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
