import Link from "next/link";
import { getStore } from "@/lib/crm-store";

export default async function CrmHome() {
  const store = await getStore();
  const openDeals = store.deals.filter((d) => d.stage !== "Client signed (won)" && d.stage !== "Lost");

  return (
    <div>
      <div className="flex items-center gap-3">
        <img src="/bos360-logo.svg" alt="BOS360 logo" className="h-12 w-auto rounded-md border border-neutral-800" />
        <h1 className="text-3xl font-bold">Bos360 CRM</h1>
      </div>
      <p className="mt-2 text-slate-400">Clean and efficient, built for your pipeline.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card label="Contacts" value={store.contacts.length} href="/crm/contacts" />
        <Card label="Deals" value={store.deals.length} href="/crm/deals" />
        <Card label="Open Deals" value={openDeals.length} href="/crm/deals" />
        <Card label="Tasks" value={store.tasks.filter((t) => !t.done).length} href="/crm/tasks" />
      </div>
    </div>
  );
}

function Card({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}
