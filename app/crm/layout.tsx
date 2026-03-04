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
          <div className="mx-auto flex max-w-7xl items-start px-6 pt-4 pb-5">
            <Link href="/crm" className="mt-1 flex shrink-0 flex-col items-start gap-1 leading-tight">
              <img src="/bos360-logo.svg" alt="BOS360 logo" className="h-8 w-auto rounded-sm border border-neutral-700" />
              <span className="text-lg font-bold text-slate-100" style={{ fontFamily: "var(--font-playfair-display), serif" }}>CRM</span>
            </Link>
            <CoachWidget />
            <div className="mt-2 shrink-0"><Nav /></div>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </main>
  );
}
