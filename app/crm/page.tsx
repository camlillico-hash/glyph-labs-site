export const dynamic = "force-dynamic";

import Link from "next/link";
import { getStore, now, DEAL_STAGES } from "@/lib/crm-store";
import { Activity, BriefcaseBusiness, CheckSquare, Handshake, Users, Crosshair, Funnel, BarChart3, Percent, Trophy, CircleX } from "lucide-react";

export default async function CrmHome() {
  const store = await getStore();
  const currentMs = new Date(now()).getTime();
  const oneWeekAgo = currentMs - 7 * 24 * 60 * 60 * 1000;

  const openDeals = store.deals.filter((d) => d.stage !== "Launch paid (won)" && d.stage !== "Lost");
  const wonDeals = store.deals.filter((d) => d.stage === "Launch paid (won)");
  const lostDeals = store.deals.filter((d) => d.stage === "Lost");
  const activeClients = wonDeals.length;

  const activitiesThisWeek = (store.activities || []).filter((a) => {
    const ts = a.occurredAt || a.createdAt;
    const ms = ts ? new Date(ts).getTime() : Number.NaN;
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  });

  const overdueTasks = (store.tasks || [])
    .filter((t) => !t.done && t.status !== "Completed" && t.dueDate && new Date(t.dueDate).getTime() < currentMs)
    .sort((a, b) => new Date(a.dueDate || "").getTime() - new Date(b.dueDate || "").getTime());

  const upcomingTasks = (store.tasks || [])
    .filter((t) => !t.done && t.status !== "Completed" && t.dueDate && new Date(t.dueDate).getTime() >= currentMs)
    .sort((a, b) => new Date(a.dueDate || "").getTime() - new Date(b.dueDate || "").getTime());

  const contactMap = new Map((store.contacts || []).map((c) => [c.id, `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unknown contact"]));

  const staleDeals = openDeals.filter((d) => {
    const t = new Date(d.updatedAt || d.createdAt).getTime();
    return Number.isFinite(t) && t < currentMs - 7 * 24 * 60 * 60 * 1000;
  }).length;

  const glyphStatus = overdueTasks.length > 0 || staleDeals > 0
    ? `Pressure rising: ${overdueTasks.length} overdue task(s), ${staleDeals} stale deal(s). Prioritize movement today.`
    : activeClients > 0
      ? `Strong posture. ${activeClients} active client(s) in delivery. Keep filling top-of-funnel while momentum is high.`
      : "Pipeline is clean. Push top-of-funnel and convert Discovery to Fit meetings this week.";

  const openStageSet = new Set(["Discovery meeting booked", "Discovery meeting completed", "Fit meeting booked", "Fit meeting completed", "Proposal / commitment"]);
  const weightedByStage = DEAL_STAGES.filter((stage) => openStageSet.has(stage)).map((stage) => {
    const deals = (store.deals || []).filter((d) => d.stage === stage);
    const total = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const weighted = deals.reduce((sum, d) => sum + Number(d.value || 0) * (Number(d.probability || 0) / 100), 0);
    return { stage, count: deals.length, total, weighted };
  });

  const pipelineTotals = weightedByStage.reduce((acc, row) => ({
    count: acc.count + row.count,
    total: acc.total + row.total,
    weighted: acc.weighted + row.weighted,
  }), { count: 0, total: 0, weighted: 0 });

  const discoveryCompletedSet = new Set(["Discovery meeting completed", "Fit meeting booked", "Fit meeting completed", "Proposal / commitment", "Launch paid (won)"]);
  const fitBookedSet = new Set(["Fit meeting booked", "Fit meeting completed", "Proposal / commitment", "Launch paid (won)"]);
  const fitCompletedSet = new Set(["Fit meeting completed", "Proposal / commitment", "Launch paid (won)"]);

  const discoveryCompletedCount = store.deals.filter((d) => discoveryCompletedSet.has(d.stage)).length;
  const fitBookedCount = store.deals.filter((d) => fitBookedSet.has(d.stage)).length;
  const fitCompletedCount = store.deals.filter((d) => fitCompletedSet.has(d.stage)).length;
  const wonCount = activeClients;

  const connectedCount = store.contacts.filter((c) => c.status === "Connected" || c.status === "Discovery meeting booked").length;
  const discoveryBookedContacts = store.contacts.filter((c) => c.status === "Discovery meeting booked").length;

  const conversion = {
    connectedToDiscoveryBooked: connectedCount > 0 ? Math.round((discoveryBookedContacts / connectedCount) * 100) : 0,
    discoveryToFitBooked: discoveryCompletedCount > 0 ? Math.round((fitBookedCount / discoveryCompletedCount) * 100) : 0,
    fitCompletedToWon: fitCompletedCount > 0 ? Math.round((wonCount / fitCompletedCount) * 100) : 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold"><Crosshair size={28} /> Command Post</h1>
        <p className="mt-2 text-slate-400">No easy button: stay informed, stay dangerous, and execute the next right move.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card icon={<Activity size={16} />} label="Activities this week" value={activitiesThisWeek.length} href="/crm/activities" />
        <div className="crm-card p-4 lg:col-span-2">
          <p className="text-sm text-slate-400">Status report from Sgt. Glyph</p>
          <p className="mt-2 text-slate-100">{glyphStatus}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="crm-card p-4">
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-400"><CheckSquare size={14} /> Overdue tasks</p>
          {overdueTasks.length === 0 ? <p className="text-sm text-slate-500">No overdue tasks.</p> : (
            <ul className="space-y-2 text-sm">
              {overdueTasks.slice(0, 8).map((t) => <li key={t.id} className="text-slate-200">• {t.title} <span className="text-slate-400">({contactMap.get(t.relatedId || "") || "Unlinked"}, {t.dueDate})</span></li>)}
            </ul>
          )}
        </div>
        <div className="crm-card p-4">
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-400"><CheckSquare size={14} /> Upcoming tasks</p>
          {upcomingTasks.length === 0 ? <p className="text-sm text-slate-500">No upcoming dated tasks.</p> : (
            <ul className="space-y-2 text-sm">
              {upcomingTasks.slice(0, 8).map((t) => <li key={t.id} className="text-slate-200">• {t.title} <span className="text-slate-400">({contactMap.get(t.relatedId || "") || "Unlinked"}, {t.dueDate})</span></li>)}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><Funnel size={18} /> Funnel</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card icon={<Users size={16} />} label="Contacts" value={store.contacts.length} href="/crm/contacts" />
          <Card icon={<BriefcaseBusiness size={16} />} label="Open Deals" value={openDeals.length} href="/crm/deals" />
          <Card icon={<Handshake size={16} />} label="Active Clients" value={activeClients} href="/crm/clients" />
        </div>
      </section>

      <section className="crm-card p-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><BarChart3 size={18} /> Open Pipeline</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400">
              <tr>
                <th className="px-2 py-2 text-left">Stage</th>
                <th className="px-2 py-2 text-right">Deals</th>
                <th className="px-2 py-2 text-right">Total</th>
                <th className="px-2 py-2 text-right">Weighted</th>
              </tr>
            </thead>
            <tbody>
              {weightedByStage.map((row) => (
                <tr key={row.stage} className="border-b border-neutral-900">
                  <td className="px-2 py-2">{row.stage}</td>
                  <td className="px-2 py-2 text-right">{row.count}</td>
                  <td className="px-2 py-2 text-right">${Math.round(row.total).toLocaleString()}</td>
                  <td className="px-2 py-2 text-right">${Math.round(row.weighted).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="font-semibold text-slate-200">
                <td className="px-2 py-2">Totals</td>
                <td className="px-2 py-2 text-right">{pipelineTotals.count}</td>
                <td className="px-2 py-2 text-right">${Math.round(pipelineTotals.total).toLocaleString()}</td>
                <td className="px-2 py-2 text-right">${Math.round(pipelineTotals.weighted).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="crm-card p-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><Percent size={18} /> Conversion rates</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between"><span>Connected → Discovery booked</span><span className="font-semibold">{conversion.connectedToDiscoveryBooked}%</span></li>
          <li className="flex items-center justify-between"><span>Discovery completed → Fit booked</span><span className="font-semibold">{conversion.discoveryToFitBooked}%</span></li>
          <li className="flex items-center justify-between"><span>Fit completed → Won</span><span className="font-semibold">{conversion.fitCompletedToWon}%</span></li>
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="crm-card p-4">
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><Trophy size={18} /> Won deals</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-800 text-slate-400">
                <tr><th className="px-2 py-2 text-left">Deal</th><th className="px-2 py-2 text-left">Company</th><th className="px-2 py-2 text-right">Amount</th></tr>
              </thead>
              <tbody>
                {wonDeals.map((d) => (
                  <tr key={d.id} className="border-b border-neutral-900">
                    <td className="px-2 py-2">{d.name || "Untitled deal"}</td>
                    <td className="px-2 py-2">{d.company || "—"}</td>
                    <td className="px-2 py-2 text-right">${Math.round(Number(d.value || 0)).toLocaleString()}</td>
                  </tr>
                ))}
                {wonDeals.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No won deals yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="crm-card p-4">
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><CircleX size={18} /> Lost deals</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-800 text-slate-400">
                <tr><th className="px-2 py-2 text-left">Deal</th><th className="px-2 py-2 text-left">Company</th><th className="px-2 py-2 text-right">Amount</th></tr>
              </thead>
              <tbody>
                {lostDeals.map((d) => (
                  <tr key={d.id} className="border-b border-neutral-900">
                    <td className="px-2 py-2">{d.name || "Untitled deal"}</td>
                    <td className="px-2 py-2">{d.company || "—"}</td>
                    <td className="px-2 py-2 text-right">${Math.round(Number(d.value || 0)).toLocaleString()}</td>
                  </tr>
                ))}
                {lostDeals.length === 0 && <tr><td className="px-2 py-3 text-slate-500" colSpan={3}>No lost deals.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
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
