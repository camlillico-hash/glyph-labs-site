"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BriefcaseBusiness, CheckSquare, Settings, LogOut, Activity, Handshake, Crosshair } from "lucide-react";

function navClass(active: boolean) {
  return `crm-nav-link inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-2 sm:py-1 ${active ? "bg-emerald-900/35 text-emerald-200 border border-emerald-700/60" : ""}`;
}

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 pt-1 sm:pt-0 text-sm">
      <Link title="Command Post" aria-label="Command Post" className={`${navClass(pathname === '/crm')} text-[#ffb401]`} href="/crm"><Crosshair size={18} /></Link>
      <Link className={navClass(pathname.startsWith('/crm/contacts'))} href="/crm/contacts"><Users size={18} /><span className="hidden sm:inline"> Contacts</span></Link>
      <Link className={navClass(pathname.startsWith('/crm/deals'))} href="/crm/deals"><BriefcaseBusiness size={18} /><span className="hidden sm:inline"> Deals</span></Link>
      <Link className={navClass(pathname.startsWith('/crm/clients'))} href="/crm/clients"><Handshake size={18} /><span className="hidden sm:inline"> Clients</span></Link>
      <Link className={navClass(pathname.startsWith('/crm/tasks'))} href="/crm/tasks"><CheckSquare size={18} /><span className="hidden sm:inline"> Tasks</span></Link>
      <Link className={navClass(pathname.startsWith('/crm/activities'))} href="/crm/activities"><Activity size={18} /><span className="hidden sm:inline"> Activities</span></Link>
      <Link title="Settings" aria-label="Settings" className={navClass(pathname.startsWith('/crm/settings'))} href="/crm/settings"><Settings size={18} /></Link>
      <button
        type="button"
        className="crm-btn-ghost inline-flex items-center gap-1.5" title="Logout" aria-label="Logout"
        onClick={async () => {
          await fetch('/api/crm/auth', { method: 'DELETE' });
          window.location.href = '/crm/login';
        }}
      >
        <LogOut size={18} />
      </button>
    </nav>
  );
}
