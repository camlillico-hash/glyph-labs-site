export const dynamic = "force-dynamic";

export const metadata = {
  title: "CRM",
};

import Link from "next/link";
import { getStore, now, CONTACT_PIPELINES, CONNECTOR_STAGES, ICP_STAGES, DEAL_STAGES } from "@/lib/crm-store";
import { computeCoachMood } from "@/lib/coach-mood";
import { Activity, BriefcaseBusiness, CheckSquare, Handshake, Users, Crosshair, Funnel, BarChart3, Percent, Trophy, CircleX, Flame, Hammer, Heart, Clock3 } from "lucide-react";
import KpiScoreboard from "./KpiScoreboard";

export default async function CrmHome() {
  let storeRaw: any = null;
  try {
    const { resolveActiveAccountId } = await import("@/lib/crm-scope");
    const accountId = await resolveActiveAccountId();
    storeRaw = await getStore(accountId);
  } catch (error) {
    console.error("[crm/home] getStore failed", error);
    storeRaw = {};
  }

  const store: { contacts: any[]; deals: any[]; tasks: any[]; activities: any[]; gmail: any; targets?: any } = {
    contacts: Array.isArray(storeRaw?.contacts) ? storeRaw.contacts : [],
    deals: Array.isArray(storeRaw?.deals) ? storeRaw.deals : [],
    tasks: Array.isArray(storeRaw?.tasks) ? storeRaw.tasks : [],
    activities: Array.isArray(storeRaw?.activities) ? storeRaw.activities : [],
    gmail: storeRaw?.gmail && typeof storeRaw.gmail === "object" ? storeRaw.gmail : { messages: [] },
    targets: storeRaw?.targets && typeof storeRaw.targets === "object" ? storeRaw.targets : undefined,
  };

  const currentMs = new Date(now()).getTime();
  const oneWeekAgo = currentMs - 7 * 24 * 60 * 60 * 1000;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartMs = monthStart.getTime();

  const openDeals = store.deals.filter((d) => !["Launch paid (won)", "Lost"].includes(d.stage));
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

  const coach = computeCoachMood(store);
  const GlyphMoodIcon = coach.icon === "flame" ? Flame : coach.icon === "heart" ? Heart : Hammer;
  const commandPostLineByMood =
    coach.mood === "fired_up"
      ? "Immediate action required: clear overdue commitments and move at least one deal forward today."
      : coach.mood === "crushing"
        ? "Strong operating rhythm. Protect momentum and keep your standards high."
        : "Steady execution mode. Keep deal velocity up and avoid idle pipeline stages.";

  const glyphMood = {
    color: coach.iconColor === "red" ? "text-rose-300" : coach.iconColor === "green" ? "text-emerald-300" : "text-sky-300",
    nameColor: coach.iconColor === "red" ? "text-rose-300" : coach.iconColor === "green" ? "text-emerald-300" : "text-sky-300",
    text: commandPostLineByMood,
    statusLabel: coach.statusLabel,
  };

  const openStageSet = new Set(["Warm intro booked", "Warm intro completed", "90-min disco booked", "90-min disco completed", "Proposal / commitment"]);
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

  const connectorContacts = store.contacts.filter((c) => (c.pipelineType || "icp") === "connector");
  const icpContacts = store.contacts.filter((c) => (c.pipelineType || "icp") === "icp");

  const connectorActivatedOrLater = connectorContacts.filter((c) => ["Activated", "Intro Pending", "Intro Delivered", "Nurture", "Closed Lost"].includes(c.status || "")).length;
  const connectorIntroDelivered = connectorContacts.filter((c) => (c.status || "") === "Intro Delivered").length;
  const icpWarmIntroBooked = icpContacts.filter((c) => (c.status || "") === "Warm intro booked").length;
  const warmIntroCompletedCount = store.deals.filter((d) => ["Warm intro completed", "90-min disco booked", "90-min disco completed", "Proposal / commitment", "Launch paid (won)"].includes(d.stage)).length;
  const wonCount = activeClients;

  const conversion = {
    activatedToIntroDelivered: connectorActivatedOrLater > 0 ? Math.round((connectorIntroDelivered / connectorActivatedOrLater) * 100) : 0,
    introDeliveredToWarmIntroBooked: connectorIntroDelivered > 0 ? Math.round((icpWarmIntroBooked / connectorIntroDelivered) * 100) : 0,
    warmIntroBookedToWon: icpWarmIntroBooked > 0 ? Math.round((wonCount / icpWarmIntroBooked) * 100) : 0,
    warmIntroCompletedToWon: warmIntroCompletedCount > 0 ? Math.round((wonCount / warmIntroCompletedCount) * 100) : 0,
  };

  // Transition plan dashboard metrics
  const targets = {
    revenueGoalAnnual: 160000,
    avgRevenuePerClientAnnual: 25000,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 18)).toISOString().slice(0, 10),
    convActivatedToIntroDelivered: 50,
    convIntroDeliveredToWarmIntroBooked: 50,
    convWarmIntroBookedToWon: 80,
    ...(store.targets || {}),
  };

  const recurringRevenue = wonDeals.reduce((sum, d) => sum + Number(d.annualFee || 0), 0);
  const annualizedRevenue = Math.round(recurringRevenue);
  const potentialClients = openDeals.filter((d) => ["Warm intro completed", "90-min disco booked", "90-min disco completed", "Fit meeting booked", "Fit meeting completed", "Proposal / commitment"].includes(d.stage)).length;

  const requiredClients = Math.max(1, Math.ceil((targets.revenueGoalAnnual || 0) / Math.max(1, targets.avgRevenuePerClientAnnual || 1)));
  const targetDateMs = new Date(targets.targetDate).getTime();
  const monthsRemaining = Number.isFinite(targetDateMs) ? Math.max(1, Math.ceil((targetDateMs - Date.now()) / (1000 * 60 * 60 * 24 * 30))) : 18;

  const closeRate = Math.max(0.01, (targets.convWarmIntroBookedToWon || 0) / 100);
  const introToWarmIntroRate = Math.max(0.01, (targets.convIntroDeliveredToWarmIntroBooked || 0) / 100);
  const activatedToIntroDeliveredRate = Math.max(0.01, (targets.convActivatedToIntroDelivered || 0) / 100);

  const requiredWarmIntros = Math.ceil(requiredClients / closeRate);
  const requiredIntrosDelivered = Math.ceil(requiredWarmIntros / introToWarmIntroRate);
  const requiredActivatedConnectors = Math.ceil(requiredIntrosDelivered / activatedToIntroDeliveredRate);

  const annualActivatedTarget = Math.max(1, Math.ceil((requiredActivatedConnectors / monthsRemaining) * 12));
  const annualIntroDeliveredTarget = Math.max(1, Math.ceil((requiredIntrosDelivered / monthsRemaining) * 12));
  const annualWarmIntroTarget = Math.max(1, Math.ceil((requiredWarmIntros / monthsRemaining) * 12));
  const annualCloseTarget = Math.max(1, Math.ceil((requiredClients / monthsRemaining) * 12));

  const weeklyConnectorActivationTarget = Math.max(1, Math.ceil(annualActivatedTarget / 52));
  const weeklyIntroDeliveredTarget = Math.max(1, Math.ceil(annualIntroDeliveredTarget / 52));
  const weeklyWarmIntroTarget = Math.max(1, Math.ceil(annualWarmIntroTarget / 52));
  const weeklyFollowupsTarget = Math.max(3, Math.ceil(weeklyConnectorActivationTarget * 2));

  const reducedHoursReady = activeClients >= Math.max(4, Math.ceil(requiredClients * 0.6)) && annualizedRevenue >= Math.round(targets.revenueGoalAnnual * 0.67);
  const fullExitReady = activeClients >= requiredClients && annualizedRevenue >= targets.revenueGoalAnnual && potentialClients >= 2;

  const connectorActivationsYtd = connectorContacts.filter((c) => ["Activated", "Intro Pending", "Intro Delivered", "Nurture", "Closed Lost"].includes(c.status || "")).length;
  const introsDeliveredYtd = connectorContacts.filter((c) => (c.status || "") === "Intro Delivered").length;
  const warmIntrosYtd = icpContacts.filter((c) => (c.status || "") === "Warm intro booked").length;
  const clientsClosedYtd = wonDeals.length;

  const weeklyActivitiesRecords = activitiesThisWeek;
  const weeklyNewContactsRecords = (store.contacts || []).filter((c) => {
    const ms = new Date(c.createdAt || c.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  });
  const weeklyNewDealsRecords = (store.deals || []).filter((d) => {
    const ms = new Date(d.createdAt || d.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  });

  const kpiItems = [
    {
      key: "weekly-activities",
      label: "Activities (weekly)",
      value: weeklyActivitiesRecords.length,
      target: "20",
      ok: weeklyActivitiesRecords.length >= 20,
      records: weeklyActivitiesRecords.map((a) => ({
        id: `activity-${a.id}`,
        name: contactMap.get(a.contactId || "") || a.note || "Activity",
        status: a.type || "activity",
      })),
    },
    {
      key: "weekly-contacts",
      label: "New contacts added (weekly)",
      value: weeklyNewContactsRecords.length,
      target: "3",
      ok: weeklyNewContactsRecords.length >= 3,
      records: weeklyNewContactsRecords.map((c) => ({
        id: `contact-${c.id}`,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unnamed contact",
        status: c.status || ((c.pipelineType || "icp") === "connector" ? "Identified" : "New"),
      })),
    },
    {
      key: "weekly-deals",
      label: "New deals created (weekly)",
      value: weeklyNewDealsRecords.length,
      target: "1",
      ok: weeklyNewDealsRecords.length >= 1,
      records: weeklyNewDealsRecords.map((d) => ({
        id: `deal-${d.id}`,
        name: d.name || "Untitled deal",
        status: d.stage || "—",
      })),
    },
  ];

  const monthlyWarmIntrosRecords = (store.contacts || []).filter((c) => {
    const ms = new Date(c.updatedAt || c.createdAt).getTime();
    return Number.isFinite(ms) && ms >= monthStartMs && (c.status || "") === "Warm intro booked";
  });
  const monthlyDiscoveryRecords = (store.deals || []).filter((d) => {
    const ms = new Date(d.updatedAt || d.createdAt).getTime();
    return Number.isFinite(ms) && ms >= monthStartMs && ["90-min disco booked", "90-min disco completed", "Fit meeting booked", "Fit meeting completed"].includes(d.stage || "");
  });
  const monthlyPipelineRecords = (store.deals || []).filter((d) => {
    const ms = new Date(d.createdAt || d.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= monthStartMs && !["Launch paid (won)", "Lost"].includes(d.stage || "");
  });


  const monthlyPipelineValue = monthlyPipelineRecords.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const monthlyItems = [
    {
      key: "monthly-warm-intros",
      label: "ICP warm intros booked (monthly)",
      value: monthlyWarmIntrosRecords.length,
      target: "2",
      ok: monthlyWarmIntrosRecords.length >= 2,
      records: monthlyWarmIntrosRecords.map((c) => ({
        id: `mwarm-${c.id}`,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unnamed contact",
        status: c.status || ((c.pipelineType || "icp") === "connector" ? "Identified" : "New"),
      })),
    },
    {
      key: "monthly-discovery",
      label: "Discovery (monthly)",
      value: monthlyDiscoveryRecords.length,
      target: "1",
      ok: monthlyDiscoveryRecords.length >= 1,
      records: monthlyDiscoveryRecords.map((d) => ({
        id: `mdisc-${d.id}`,
        name: d.name || "Untitled deal",
        status: d.stage || "—",
      })),
    },
    {
      key: "monthly-pipeline",
      label: "New pipeline (monthly)",
      value: `$${Math.round(monthlyPipelineValue / 1000)}K`,
      target: "$45K",
      ok: monthlyPipelineValue >= 45000,
      records: monthlyPipelineRecords.map((d) => ({
        id: `mpipe-${d.id}`,
        name: d.name || "Untitled deal",
        status: `$${Math.round(Number(d.value || 0)).toLocaleString()} • ${d.stage || "—"}`,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold"><Crosshair size={28} /> Command Post</h1>
        <p className="mt-2 text-slate-400">Your numbers, your mission, your next move.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card icon={<Activity size={16} />} label="Activities this week" value={activitiesThisWeek.length} href="/crm/activities" />
        <Link href="/crm/activities" className="crm-card block p-4 hover:-translate-y-0.5 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-300 inline-flex items-center gap-1.5">Status report from <span className={`${glyphMood.nameColor} inline-flex items-center gap-1`}>Sgt. Glyph <GlyphMoodIcon size={14} /></span></p>
          <p className={`mt-2 text-sm font-semibold ${glyphMood.color}`}>{glyphMood.statusLabel}</p>
          <p className="mt-1 text-slate-100">{glyphMood.text}</p>
        </Link>
      </section>

      <section className="crm-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold"><Crosshair size={18} /> Revenue Targets</h2>
          <Link href="/crm/settings" className="rounded border border-neutral-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-neutral-500">
            Change targets
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Active clients</p>
            <p className="text-2xl font-bold">{activeClients} <span className="text-sm text-slate-400">/ {requiredClients}</span></p>
          </div>
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Annualized coaching revenue</p>
            <p className="text-2xl font-bold">${annualizedRevenue.toLocaleString()} <span className="text-sm text-slate-400">/ ${Math.round(targets.revenueGoalAnnual / 1000)}k</span></p>
          </div>
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Pipeline potentials</p>
            <p className="text-2xl font-bold">{potentialClients} <span className="text-sm text-slate-400">/ 2+</span></p>
          </div>
          <div className="rounded-lg border border-neutral-800 p-3">
            <p className="text-xs text-slate-400">Warm intros booked (YTD)</p>
            <p className="text-2xl font-bold">{warmIntrosYtd} <span className="text-sm text-slate-400">/ {annualWarmIntroTarget}</span></p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className={`rounded-lg border p-3 ${reducedHoursReady ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            <p className="text-sm font-semibold">Trigger 1 — Reduced Hours</p>
            <p className="text-xs text-slate-300 mt-1">Needs: {Math.max(4, Math.ceil(requiredClients * 0.6))} active clients + ~${Math.round((targets.revenueGoalAnnual * 0.67) / 1000)}k annualized.</p>
            <p className="mt-1 text-sm">Status: <span className="font-semibold">{reducedHoursReady ? "Ready" : "Not yet"}</span></p>
          </div>
          <div className={`rounded-lg border p-3 ${fullExitReady ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            <p className="text-sm font-semibold">Trigger 2 — Full Exit</p>
            <p className="text-xs text-slate-300 mt-1">Needs: {requiredClients} clients + ${Math.round(targets.revenueGoalAnnual / 1000)}k recurring + 2+ potentials.</p>
            <p className="mt-1 text-sm">Status: <span className="font-semibold">{fullExitReady ? "Ready" : "Not yet"}</span></p>
          </div>
        </div>
      </section>

      <section className="crm-card p-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><CheckSquare size={18} /> Weekly KPI Scoreboard</h2>
        <KpiScoreboard items={kpiItems} />
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Monthly KPIs</h3>
          <KpiScoreboard items={monthlyItems} />
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
                    <li className="flex items-center justify-between"><span>Activated → Intro Delivered</span><span className="font-semibold">{conversion.activatedToIntroDelivered}%</span></li>
          <li className="flex items-center justify-between"><span>Intro Delivered → Warm intro booked</span><span className="font-semibold">{conversion.introDeliveredToWarmIntroBooked}%</span></li>
          <li className="flex items-center justify-between"><span>Warm intro booked → Won</span><span className="font-semibold">{conversion.warmIntroBookedToWon}%</span></li>
          <li className="flex items-center justify-between"><span>Warm intro completed → Won</span><span className="font-semibold">{conversion.warmIntroCompletedToWon}%</span></li>
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
