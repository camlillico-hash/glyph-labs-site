"use client";

import * as React from "react";

export default function FaqItem({ q, a }: { q: string; a: string }) {
  const id = React.useId();

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={false}
        aria-controls={id}
        onClick={(e) => {
          const root = e.currentTarget.closest("[data-faq]") as HTMLElement | null;
          if (!root) return;
          const open = root.getAttribute("data-open") === "true";
          root.setAttribute("data-open", open ? "false" : "true");
        }}
      >
        <span className="text-sm font-semibold text-slate-200">{q}</span>
        <span className="text-slate-400 transition-transform [data-open='true']&:rotate-180">⌄</span>
      </button>

      <div
        id={id}
        className="grid grid-rows-[0fr] px-5 pb-0 transition-[grid-template-rows,padding] duration-200 [data-open='true']&:grid-rows-[1fr] [data-open='true']&:pb-4"
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-slate-400">{a}</p>
        </div>
      </div>
    </div>
  );
}
