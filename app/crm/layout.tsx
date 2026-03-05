"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import CoachWidget from "./CoachWidget";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/crm/login";

  return (
    <main className="min-h-screen crm-shell text-slate-100">
      {!isLogin && (
        <header className="border-b border-neutral-800/80 bg-neutral-900/75 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-start justify-between px-6 pt-4 pb-5">
            <Link href="/crm" className="mt-1 flex shrink-0 items-center leading-tight">
              <img src="/glyph-crm-logo.png" alt="Glyph CRM logo" className="h-12 w-auto" />
            </Link>
            <CoachWidget mode="desktop-inline" />
            <div className="mt-2 ml-auto shrink-0 sm:ml-4"><Nav /></div>
          </div>
          <div className="mx-auto max-w-7xl px-6 pb-3">
            <CoachWidget mode="mobile-accordion" />
          </div>
        </header>
      )}
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </main>
  );
}
