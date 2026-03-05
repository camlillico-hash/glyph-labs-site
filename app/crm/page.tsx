export const dynamic = "force-dynamic";

import Link from "next/link";
import { getStore, now } from "@/lib/crm-store";
import { Users, BriefcaseBusiness, BarChart3, CheckSquare, Handshake, Activity } from "lucide-react";

export default async function CrmHome() {
  const store = await getStore();
  const openDeals = store.deals.filter((d) => d.stage !== "Client signed (won)" && d.stage !== "Lost");
  const activeClients = store.deals.filter((d) => d.stage === "Client signed (won)").length;
  const oneWeekAgo = new Date(now()).getTime() - 7 * 24 * 60 * 60 * 1000;
  const activitiesThisWeek = (store.activities || []).filter((a) => {
    const ts = a.occurredAt || a.createdAt;
    const ms = ts ? new Date(ts).getTime() : Number.NaN;
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  }).length;

  return (
    <div>
      <span className="crm-kicker">BOS360 Internal</span>
      <div className="mt-3 flex items-center gap-3">
        <img src="/bos360-logo.svg" alt="BOS360 logo" className="h-12 w-auto rounded-md border border-neutral-800" />
        <h1 className="text-3xl font-bold">Bos360 CRM</h1>
      </div>
      <p className="mt-2 text-slate-400">Clean and efficient, built for your pipeline.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Card icon={<Users size={16} />} label="Contacts" value={store.contacts.length} href="/crm/contacts" />
        <Card icon={<BriefcaseBusiness size={16} />} label="Deals" value={store.deals.length} href="/crm/deals" />
        <Card icon={<BarChart3 size={16} />} label="Open Deals" value={openDeals.length} href="/crm/deals" />
        <Card icon={<Handshake size={16} />} label="Active Clients" value={activeClients} href="/crm/clients" />
        <Card icon={<Activity size={16} />} label="Activities this week" value={activitiesThisWeek} href="/crm/activities" />
        <Card icon={<CheckSquare size={16} />} label="Tasks" value={store.tasks.filter((t) => !t.done).length} href="/crm/tasks" />
      </div>
    </div>
  );
}

function Card({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="crm-card p-4 hover:-translate-y-0.5">
      <p className="text-sm text-slate-400 inline-flex items-center gap-1.5">{icon} {label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}
