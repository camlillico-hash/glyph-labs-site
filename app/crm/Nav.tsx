"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link className="crm-nav-link" href="/crm/contacts">👥 Contacts</Link>
      <Link className="crm-nav-link" href="/crm/deals">💼 Deals</Link>
      <Link className="crm-nav-link" href="/crm/tasks">✅ Tasks</Link>
      <Link className="crm-nav-link" href="/crm/settings">⚙️ Settings</Link>
      <button
        type="button"
        className="crm-btn-ghost"
        onClick={async () => {
          await fetch('/api/crm/auth', { method: 'DELETE' });
          window.location.href = '/crm/login';
        }}
      >
        🚪 Logout
      </button>
    </nav>
  );
}
