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
            <Link href="/crm" className="text-lg font-semibold tracking-tight">CRM</Link>
            <Nav />
          </div>
        </header>
      )}
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </main>
  );
}
