import Link from "next/link";
import { getStore } from "@/lib/crm-store";

export default async function CrmHome() {
  const store = await getStore();
  const openDeals = store.deals.filter((d) => d.stage !== "Client signed (won)" && d.stage !== "Lost");

  return (
    <div>
      <span className="crm-kicker">◉ BOS360 Internal</span>
      <div className="mt-3 flex items-center gap-3">
        <img src="/bos360-logo.svg" alt="BOS360 logo" className="h-12 w-auto rounded-md border border-neutral-800" />
        <h1 className="text-3xl font-bold">Bos360 CRM</h1>
      </div>
      <p className="mt-2 text-slate-400">Clean and efficient, built for your pipeline.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card icon="👥" label="Contacts" value={store.contacts.length} href="/crm/contacts" />
        <Card icon="💼" label="Deals" value={store.deals.length} href="/crm/deals" />
        <Card icon="📈" label="Open Deals" value={openDeals.length} href="/crm/deals" />
        <Card icon="✅" label="Tasks" value={store.tasks.filter((t) => !t.done).length} href="/crm/tasks" />
      </div>
    </div>
  );
}

function Card({ icon, label, value, href }: { icon: string; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="crm-card p-4">
      <p className="text-sm text-slate-400">{icon} {label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}
