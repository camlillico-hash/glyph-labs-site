"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("site-theme");
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const isLight = saved ? saved === "light" : prefersLight;
    document.documentElement.classList.toggle("theme-light", isLight);
    setLight(isLight);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("theme-light", next);
    localStorage.setItem("site-theme", next ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/70 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-800"
      aria-label="Toggle light mode"
      title={light ? "Switch to dark" : "Switch to light"}
    >
      <span className="text-[10px] uppercase tracking-wide">{light ? "Light" : "Dark"}</span>
      <span className={`relative h-5 w-9 rounded-full transition ${light ? "bg-cyan-500/90" : "bg-slate-600"}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${light ? "left-4" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}
