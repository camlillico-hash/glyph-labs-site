"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "./Nav";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/crm/login";

  return (
    <main className="min-h-screen bg-neutral-950 text-slate-100">
      {!isLogin && (
        <header className="border-b border-neutral-800 bg-neutral-900/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/crm" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <img src="/bos360-logo.svg" alt="BOS360 logo" className="h-7 w-auto rounded-sm border border-neutral-800" />
              <span>CRM</span>
            </Link>
            <Nav />
          </div>
        </header>
      )}
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </main>
  );
}
