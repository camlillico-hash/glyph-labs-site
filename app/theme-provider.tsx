"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = "light",
  enableOverride = false
}: { 
  children: ReactNode; 
  defaultTheme?: Theme;
  enableOverride?: boolean; // When true, use defaultTheme without persisting to localStorage
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (enableOverride) {
      // Force the default theme without affecting localStorage
      setThemeState(defaultTheme);
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(`theme-${defaultTheme}`);
      return;
    }
    
    // Read theme from localStorage or use default
    const stored = localStorage.getItem("site-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(`theme-${stored}`);
    } else {
      setThemeState(defaultTheme);
      localStorage.setItem("site-theme", defaultTheme);
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(`theme-${defaultTheme}`);
    }
  }, [defaultTheme, enableOverride]);

  useEffect(() => {
    if (!mounted) return;
    if (enableOverride) return; // Don't persist override themes
    
    // Update localStorage and HTML class when theme changes
    localStorage.setItem("site-theme", theme);
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme, mounted, enableOverride]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // Don't persist if we're in override mode
    if (!enableOverride) {
      localStorage.setItem("site-theme", newTheme);
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.documentElement.classList.add(`theme-${newTheme}`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
