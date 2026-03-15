export const dynamic = "force-dynamic";

export const metadata = {
  title: "CRM",
};

import Link from "next/link";
import { getStore, now, DEAL_STAGES } from "@/lib/crm-store";
import { Activity, BriefcaseBusiness, CheckSquare, Handshake, Users, Crosshair, Funnel, BarChart3, Percent, Trophy, CircleX, Flame, Hammer, Heart, Clock3 } from "lucide-react";

export default async function CrmHome() {
  let storeRaw: any = null;
  try {
    storeRaw = await getStore();
  } catch (error) {
    console.error("[crm/home] getStore failed", error);
    storeRaw = {};
  }

  const store: { contacts: any[]; deals: any[]; tasks: any[]; activities: any[]; gmail: any } = {
    contacts: Array.isArray(storeRaw?.contacts) ? storeRaw.contacts : [],
    deals: Array.isArray(storeRaw?.deals) ? storeRaw.deals : [],
    tasks: Array.isArray(storeRaw?.tasks) ? storeRaw.tasks : [],
    activities: Array.isArray(storeRaw?.activities) ? storeRaw.activities : [],
    gmail: storeRaw?.gmail && typeof storeRaw.gmail === "object" ? storeRaw.gmail : { messages: [] },
  };

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
  const doneTasks = (store.tasks || []).filter((t: any) => t.done || t.status === "Completed").length;
  const lastUpdatedAt = [
    ...store.contacts.map((c) => c.updatedAt),
    ...store.deals.map((d) => d.updatedAt),
    ...store.tasks.map((t) => t.updatedAt),
  ].filter(Boolean).sort().reverse()[0];
  const staleDays = lastUpdatedAt ? (currentMs - new Date(lastUpdatedAt).getTime()) / (1000 * 60 * 60 * 24) : 999;
  const latestWonAt = wonDeals.map((d) => d.updatedAt || d.createdAt).filter(Boolean).sort().reverse()[0];
  const latestWonHours = latestWonAt ? (currentMs - new Date(latestWonAt).getTime()) / (1000 * 60 * 60) : 999;

  let glyphMood = { icon: Hammer, color: "text-sky-300", nameColor: "text-sky-300", text: "Not bad, but not legendary. Move 1 deal stage and clear 2 tasks before day-end." };
  if (overdueTasks.length > 0 || staleDeals > 0 || staleDays > 2 || openDeals.length === 0) {
    glyphMood = { icon: Flame, color: "text-rose-300", nameColor: "text-rose-300", text: `You’re coasting. ${overdueTasks.length} overdue task(s), ${staleDeals} stale deal(s). Quit flirting with the to-do list and execute.` };
    if (openDeals.length === 0 && store.contacts.length > 0) glyphMood.text = "No open deals? That’s not a pipeline, that’s fan fiction. Promote a contact to Discovery right now.";
    if (store.contacts.length === 0) glyphMood.text = "Pipeline starts with people. Add 3 contacts today and stop pretending strategy is outreach.";
  }
  if (wonDeals.length >= 1 && doneTasks >= 5 && overdueTasks.length === 0 && staleDeals === 0 && staleDays <= 1) {
    glyphMood = { icon: Heart, color: "text-emerald-300", nameColor: "text-emerald-300", text: "Elite consistency. Celebrate for 30 seconds, then top up pipeline while conversion is hot." };
  }
  if (latestWonHours <= 24) {
    glyphMood = { icon: Heart, color: "text-emerald-300", nameColor: "text-emerald-300", text: "New client closed — nasty work. Take a breath, then get back to prospecting before comfort makes you soft." };
  }
  const GlyphMoodIcon = glyphMood.icon;

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
  const attemptingOrLaterNonLost = store.contacts.filter((c) => ["Attempting", "Connected", "Discovery meeting booked"].includes(c.status || "")).length;
  // Treat any later non-lost stage as having achieved "Connected", even if status was skipped.
  const countedAsConnected = store.contacts.filter((c) => ["Connected", "Discovery meeting booked"].includes(c.status || "")).length;

  const conversion = {
    attemptingToConnected: attemptingOrLaterNonLost > 0 ? Math.round((countedAsConnected / attemptingOrLaterNonLost) * 100) : 0,
    connectedToDiscoveryBooked: connectedCount > 0 ? Math.round((discoveryBookedContacts / connectedCount) * 100) : 0,
    discoveryToFitBooked: discoveryCompletedCount > 0 ? Math.round((fitBookedCount / discoveryCompletedCount) * 100) : 0,
    fitCompletedToWon: fitCompletedCount > 0 ? Math.round((wonCount / fitCompletedCount) * 100) : 0,
  };

  // Transition plan dashboard metrics
  const recurringRevenue = wonDeals.reduce((sum, d) => sum + Number(d.annualFee || 0), 0);
  const annualizedRevenue = Math.round(recurringRevenue);
  const potentialClients = openDeals.filter((d) => ["Discovery meeting completed", "Fit meeting booked", "Fit meeting completed", "Proposal / commitment"].includes(d.stage)).length;

  const reducedHoursReady = activeClients >= 4 && annualizedRevenue >= 100000;
  const fullExitReady = activeClients >= 6 && annualizedRevenue >= 150000 && potentialClients >= 2;

  const warmLeadsYtd = store.contacts.filter((c) => ["Attempting", "Connected", "Discovery meeting booked"].includes(c.status || "")).length;
  const introMeetingsYtd = store.deals.filter((d) => ["Discovery meeting booked", "Discovery meeting completed", "Fit meeting booked", "Fit meeting completed", "Proposal / commitment", "Launch paid (won)"]
    .includes(d.stage)).length;
  const discoveriesYtd = store.deals.filter((d) => ["Discovery meeting completed", "Fit meeting booked", "Fit meeting completed", "Proposal / commitment", "Launch paid (won)"]
    .includes(d.stage)).length;
  const clientsClosedYtd = wonDeals.length;

  const outreachThisWeek = activitiesThisWeek.filter((a) => ["email", "call", "text", "linkedin"].includes(a.type)).length;
  const meetingsThisWeek = activitiesThisWeek.filter((a) => a.type === "meeting").length;
  const followupsThisWeek = (store.tasks || []).filter((t) => {
    const ts = new Date(t.updatedAt || t.createdAt).getTime();
    return Number.isFinite(ts) && ts >= oneWeekAgo && ["email", "call", "text", "linkedin"].includes(t.type || "");
  }).length;
  const introRequestsThisWeek = activitiesThisWeek.filter((a) => /intro/i.test(a.note || "")).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold"><Crosshair size={28} /> Command Post</h1>
        <p className="mt-2 text-slate-400">No fairy dust, no excuses — know the score, pick your shot, and move now.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card icon={<Activity size={16} />} label="Activities this week" value={activitiesThisWeek.length} href="/crm/activities" />
        <Link href="/crm/activities" className="crm-card block p-4 hover:-translate-y-0.5 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-300 inline-flex items-center gap-1.5">Status report from <span className={`${glyphMood.nameColor} inline-flex items-center gap-1`}>Sgt. Glyph <GlyphMoodIcon size={14} /></span></p>
          <p className="mt-2 text-slate-100">{glyphMood.text}</p>
        </Link>
      </section>

      <section className="crm-card p-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><Crosshair size={18} /> Transition Dashboard</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Active clients</p>
            <p className="text-2xl font-bold">{activeClients} <span className="text-sm text-slate-400">/ 6</span></p>
          </div>
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Annualized coaching revenue</p>
            <p className="text-2xl font-bold">${annualizedRevenue.toLocaleString()} <span className="text-sm text-slate-400">/ $150k</span></p>
          </div>
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Pipeline potentials</p>
            <p className="text-2xl font-bold">{potentialClients} <span className="text-sm text-slate-400">/ 2+</span></p>
          </div>
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Discovery sessions (YTD)</p>
            <p className="text-2xl font-bold">{discoveriesYtd} <span className="text-sm text-slate-400">/ 3–4</span></p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className={`rounded-lg border p-3 ${reducedHoursReady ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            <p className="text-sm font-semibold">Trigger 1 — Reduced Hours</p>
            <p className="text-xs text-slate-300 mt-1">Needs: 4 active clients + ~$100k annualized.</p>
            <p className="mt-1 text-sm">Status: <span className="font-semibold">{reducedHoursReady ? "Ready" : "Not yet"}</span></p>
          </div>
          <div className={`rounded-lg border p-3 ${fullExitReady ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            <p className="text-sm font-semibold">Trigger 2 — Full Exit</p>
            <p className="text-xs text-slate-300 mt-1">Needs: 6 clients + $150k recurring + 2+ potentials.</p>
            <p className="mt-1 text-sm">Status: <span className="font-semibold">{fullExitReady ? "Ready" : "Not yet"}</span></p>
          </div>
        </div>
      </section>

      <section className="crm-card p-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><CheckSquare size={18} /> Weekly KPI Scoreboard</h2>
        <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-4">
          <KpiRow label="Warm outreach conversations" value={outreachThisWeek} target="2" ok={outreachThisWeek >= 2} />
          <KpiRow label="Intro meetings" value={meetingsThisWeek} target="0–1" ok={meetingsThisWeek <= 1} />
          <KpiRow label="Follow-ups" value={followupsThisWeek} target="3–5" ok={followupsThisWeek >= 3} />
          <KpiRow label="Introductions requested" value={introRequestsThisWeek} target="1–2" ok={introRequestsThisWeek >= 1} />
        </div>
        <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
          <p>Warm leads YTD: <span className="text-slate-200 font-semibold">{warmLeadsYtd}</span> / 12–16</p>
          <p>Intro meetings YTD: <span className="text-slate-200 font-semibold">{introMeetingsYtd}</span> / 6–8</p>
          <p>Discoveries YTD: <span className="text-slate-200 font-semibold">{discoveriesYtd}</span> / 3–4</p>
          <p>Clients closed YTD: <span className="text-slate-200 font-semibold">{clientsClosedYtd}</span> / 3–4</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link href="/crm/tasks" className="crm-card block p-4 hover:-translate-y-0.5">
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm text-rose-300"><Clock3 size={14} /> Overdue tasks</p>
          {overdueTasks.length === 0 ? <p className="text-sm text-slate-500">No overdue tasks.</p> : (
            <ul className="space-y-2 text-sm">
              {overdueTasks.slice(0, 8).map((t) => <li key={t.id} className="text-slate-200">• {t.title} <span className="text-slate-400">({contactMap.get(t.relatedId || "") || "Unlinked"}, {t.dueDate})</span></li>)}
            </ul>
          )}
        </Link>
        <Link href="/crm/tasks" className="crm-card block p-4 hover:-translate-y-0.5">
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm text-sky-300"><CheckSquare size={14} /> Upcoming tasks</p>
          {upcomingTasks.length === 0 ? <p className="text-sm text-slate-500">No upcoming dated tasks.</p> : (
            <ul className="space-y-2 text-sm">
              {upcomingTasks.slice(0, 8).map((t) => <li key={t.id} className="text-slate-200">• {t.title} <span className="text-slate-400">({contactMap.get(t.relatedId || "") || "Unlinked"}, {t.dueDate})</span></li>)}
            </ul>
          )}
        </Link>
      </section>

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><Funnel size={18} /> Funnel</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card icon={<Users size={16} />} label="Contacts" value={store.contacts.length} href="/crm/contacts" />
          <Card icon={<BriefcaseBusiness size={16} />} label="Open Deals" value={openDeals.length} href="/crm/deals" />
          <Card icon={<Handshake size={16} />} label="Active Clients" value={activeClients} href="/crm/clients" />
        </div>
      </section>

      <Link href="/crm/deals" className="crm-card block p-4 hover:-translate-y-0.5">
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
      </Link>

      <Link href="/crm/deals" className="crm-card block p-4 hover:-translate-y-0.5">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><Percent size={18} /> Conversion rates</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between"><span>Attempting → Connected</span><span className="font-semibold">{conversion.attemptingToConnected}%</span></li>
          <li className="flex items-center justify-between"><span>Connected → Discovery booked</span><span className="font-semibold">{conversion.connectedToDiscoveryBooked}%</span></li>
          <li className="flex items-center justify-between"><span>Discovery completed → Fit booked</span><span className="font-semibold">{conversion.discoveryToFitBooked}%</span></li>
          <li className="flex items-center justify-between"><span>Fit completed → Won</span><span className="font-semibold">{conversion.fitCompletedToWon}%</span></li>
        </ul>
      </Link>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link href="/crm/clients" className="crm-card block p-4 hover:-translate-y-0.5">
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
        </Link>

        <Link href="/crm/deals" className="crm-card block p-4 hover:-translate-y-0.5">
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
        </Link>
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

function KpiRow({ label, value, target, ok }: { label: string; value: number; target: string; ok: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/10"}`}>
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-bold">{value} <span className="text-xs font-normal text-slate-400">(target {target})</span></p>
    </div>
  );
}
