"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import CoachWidget from "./CoachWidget";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/crm/login";

  return (
    <main className="crm-shell flex min-h-screen flex-col text-slate-100">
      {!isLogin && (
        <header className="border-b border-neutral-800/80 bg-neutral-900/75 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-start justify-between px-6 pt-3 pb-2">
            <Link href="/crm" className="mt-1 flex shrink-0 items-center leading-tight">
              <img src="/glyph-crm-logo.png" alt="Glyph CRM logo" className="h-14 w-auto sm:h-16" />
            </Link>
            <CoachWidget mode="desktop-inline" />
            <div className="mt-2 ml-auto shrink-0 sm:ml-4"><Nav /></div>
          </div>
          <div className="mx-auto max-w-7xl px-6 pb-1">
            <CoachWidget mode="mobile-accordion" />
          </div>
        </header>
      )}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">{children}</div>
      {!isLogin && (
        <footer className="border-t border-neutral-700 bg-neutral-900/90 shadow-[0_-8px_28px_rgba(0,0,0,.35)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[11px] sm:text-sm text-slate-300">
            <p>© {new Date().getFullYear()} Glyph CRM</p>
            <p className="text-slate-400">Sgt. Glyph says: if your pipeline is empty, your excuses are full. Fix it.</p>
          </div>
        </footer>
      )}
    </main>
  );
}
