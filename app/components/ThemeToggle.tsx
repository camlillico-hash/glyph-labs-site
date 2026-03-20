"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
  useEffect(() => {
    // Force light mode as default (handles existing dark mode users)
    localStorage.setItem("site-theme", "light");
    document.documentElement.classList.add("theme-light");
    document.documentElement.classList.remove("theme-dark");
  }, []);

  return null;
}
