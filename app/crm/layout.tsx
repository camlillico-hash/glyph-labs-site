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
              <img src="/glyph-crm-logo.png" alt="Glyph CRM logo" className="h-16 w-auto" />
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
        <footer className="border-t border-neutral-800/80 bg-neutral-900/45">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-xs text-slate-400">
            <p>Glyph CRM</p>
            <p className="text-slate-500">Built for focus, clarity, and execution.</p>
          </div>
        </footer>
      )}
    </main>
  );
}
