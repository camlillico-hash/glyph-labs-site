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
          <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
            <Link href="/crm" className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight">
              <img src="/bos360-logo.svg" alt="BOS360 logo" className="h-7 w-auto rounded-sm border border-neutral-800" />
              <span>CRM</span>
            </Link>
            <CoachWidget />
            <div className="shrink-0"><Nav /></div>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </main>
  );
}
