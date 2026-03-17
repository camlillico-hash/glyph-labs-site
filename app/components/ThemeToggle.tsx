"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("site-theme");
    const isLight = saved ? saved === "light" : true;
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
      className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900/70 p-1 text-slate-200 hover:bg-slate-800"
      aria-label="Toggle light mode"
      title={light ? "Switch to dark" : "Switch to light"}
    >
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${light ? "bg-cyan-500 text-slate-950" : "text-slate-400"}`}>
        <Sun size={14} />
      </span>
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${!light ? "bg-slate-700 text-white" : "text-slate-500"}`}>
        <Moon size={14} />
      </span>
    </button>
  );
}
