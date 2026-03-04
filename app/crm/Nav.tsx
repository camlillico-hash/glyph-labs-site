"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BriefcaseBusiness, CheckSquare, Settings, LogOut, Activity } from "lucide-react";

function navClass(active: boolean) {
  return `crm-nav-link inline-flex items-center gap-1.5 ${active ? "bg-emerald-900/35 text-emerald-200 border border-emerald-700/60" : ""}`;
}

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link className={navClass(pathname.startsWith('/crm/contacts'))} href="/crm/contacts"><Users size={14} /> Contacts</Link>
      <Link className={navClass(pathname.startsWith('/crm/deals'))} href="/crm/deals"><BriefcaseBusiness size={14} /> Deals</Link>
      <Link className={navClass(pathname.startsWith('/crm/tasks'))} href="/crm/tasks"><CheckSquare size={14} /> Tasks</Link>
      <Link className={navClass(pathname.startsWith('/crm/activities'))} href="/crm/activities"><Activity size={14} /> Activities</Link>
      <Link title="Settings" aria-label="Settings" className={navClass(pathname.startsWith('/crm/settings'))} href="/crm/settings"><Settings size={14} /></Link>
      <button
        type="button"
        className="crm-btn-ghost inline-flex items-center gap-1.5" title="Logout" aria-label="Logout"
        onClick={async () => {
          await fetch('/api/crm/auth', { method: 'DELETE' });
          window.location.href = '/crm/login';
        }}
      >
        <LogOut size={14} />
      </button>
    </nav>
  );
}
