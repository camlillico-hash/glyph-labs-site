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
      className="rounded-md border border-slate-600 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
      aria-label="Toggle light mode"
    >
      {light ? "Light" : "Dark"}
    </button>
  );
}
