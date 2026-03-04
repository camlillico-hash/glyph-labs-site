"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex items-center gap-4 text-sm text-slate-300">
      <Link href="/crm/contacts">Contacts</Link>
      <Link href="/crm/deals">Deals</Link>
      <Link href="/crm/tasks">Tasks</Link>
      <Link href="/crm/settings">Settings</Link>
      <button
        type="button"
        className="rounded border border-neutral-700 px-2 py-1"
        onClick={async () => {
          await fetch('/api/crm/auth', { method: 'DELETE' });
          window.location.href = '/crm/login';
        }}
      >
        Logout
      </button>
    </nav>
  );
}
