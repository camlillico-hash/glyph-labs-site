export const dynamic = "force-dynamic";

export const metadata = {
  title: "CRM",
};

import Link from "next/link";
import { getStore, now, CONTACT_PIPELINES, CONNECTOR_STAGES, ICP_STAGES, DEAL_STAGES, normalizeTransitionTargets } from "@/lib/crm-store";
import { computeCoachMood } from "@/lib/coach-mood";
import { BriefcaseBusiness, CheckSquare, Handshake, Users, Crosshair, Funnel, BarChart3, Percent, Trophy, CircleX, Flame, Hammer, Heart, Clock3, Medal } from "lucide-react";
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
  const quarterStart = new Date();
  quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3, 1);
  quarterStart.setHours(0, 0, 0, 0);
  const quarterStartMs = quarterStart.getTime();

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

  const connectorPeople = store.contacts.filter((c) => (c.pipelineType || "connector") === "connector");
  const leadPeople = store.contacts.filter((c) => (c.pipelineType || "connector") === "icp");

  const connectorActivatedOrLater = connectorPeople.filter((c) => ["Activated", "Intro Pending", "Intro Delivered", "Nurture", "Closed Lost"].includes(c.status || "")).length;
  const connectorIntroDelivered = connectorPeople.filter((c) => (c.status || "") === "Intro Delivered").length;
  const leadWarmIntroBooked = leadPeople.filter((c) => (c.status || "") === "Warm intro booked").length;
  const discoveryCount = store.deals.filter((d) => ["90-min disco booked", "90-min disco completed", "Proposal / commitment", "Launch paid (won)"].includes(d.stage)).length;
  const wonCount = activeClients;

  const conversion = {
    activatedToIntroDelivered: connectorActivatedOrLater > 0 ? Math.round((connectorIntroDelivered / connectorActivatedOrLater) * 100) : 0,
    leadToWarmIntro: leadPeople.length > 0 ? Math.round((leadWarmIntroBooked / leadPeople.length) * 100) : 0,
    warmIntroToDiscovery: leadWarmIntroBooked > 0 ? Math.round((discoveryCount / leadWarmIntroBooked) * 100) : 0,
    discoveryToLaunch: discoveryCount > 0 ? Math.round((wonCount / discoveryCount) * 100) : 0,
  };

  const targets = normalizeTransitionTargets(store.targets || {});

  const potentialClients = openDeals.filter((d) => Number(d.probability || 0) >= 50).length;
  const annualizedRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const requiredClients = Math.max(1, Math.ceil(targets.revenueGoalAnnual / Math.max(1, targets.avgRevenuePerClientAnnual)));
  const targetDateMs = new Date(targets.targetDate).getTime();
  const monthsRemaining = Number.isFinite(targetDateMs) ? Math.max(1, Math.ceil((targetDateMs - Date.now()) / (1000 * 60 * 60 * 24 * 30))) : 18;

  const discoveryToLaunchRate = Math.max(0.01, (targets.convDiscoveryToLaunch || 0) / 100);
  const warmIntroToDiscoveryRate = Math.max(0.01, (targets.convWarmIntroToDiscovery || 0) / 100);
  const leadToWarmIntroRate = Math.max(0.01, (targets.convLeadToWarmIntro || 0) / 100);

  const requiredDiscoveries = Math.ceil(requiredClients / discoveryToLaunchRate);
  const requiredWarmIntros = Math.ceil(requiredDiscoveries / warmIntroToDiscoveryRate);
  const requiredLeads = Math.ceil(requiredWarmIntros / leadToWarmIntroRate);

  const annualLeadTarget = Math.max(1, Math.ceil((requiredLeads / monthsRemaining) * 12));
  const annualWarmIntroTarget = Math.max(1, Math.ceil((requiredWarmIntros / monthsRemaining) * 12));
  const annualDiscoveryTarget = Math.max(1, Math.ceil((requiredDiscoveries / monthsRemaining) * 12));
  const annualCloseTarget = Math.max(1, Math.ceil((requiredClients / monthsRemaining) * 12));

  const warmIntrosYtd = leadWarmIntroBooked;

  const targetDateLabel = Number.isFinite(targetDateMs)
    ? new Date(`${targets.targetDate}T00:00:00`).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "America/Toronto",
      })
    : "—";
  const daysRemaining = Number.isFinite(targetDateMs)
    ? Math.max(0, Math.ceil((targetDateMs - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const revenueProgressPct = Math.max(0, Math.min(100, Math.round((annualizedRevenue / Math.max(1, targets.revenueGoalAnnual)) * 100)));
  const clientProgressPct = Math.max(0, Math.min(100, Math.round((activeClients / Math.max(1, requiredClients)) * 100)));
  const discoveryProgressPct = Math.max(0, Math.min(100, Math.round((discoveryCount / Math.max(1, requiredDiscoveries)) * 100)));
  const warmIntroProgressPct = Math.max(0, Math.min(100, Math.round((warmIntrosYtd / Math.max(1, requiredWarmIntros)) * 100)));
  const leadProgressPct = Math.max(0, Math.min(100, Math.round((leadPeople.length / Math.max(1, requiredLeads)) * 100)));

  const reducedHoursReady = activeClients >= Math.max(4, Math.ceil(requiredClients * 0.6)) && annualizedRevenue >= Math.round(targets.revenueGoalAnnual * 0.67);
  const fullExitReady = activeClients >= requiredClients && annualizedRevenue >= targets.revenueGoalAnnual && potentialClients >= 2;

  const weeklyActivitiesRecords = activitiesThisWeek;
  const weeklyNewConnectorRecords = connectorPeople.filter((c) => {
    const ms = new Date(c.createdAt || c.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  });
  const newDealsThisWeek = (store.deals || []).filter((d) => {
    const ms = new Date(d.createdAt || d.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  });

  const kpiItems = [
    {
      key: "weekly-activities",
      label: "Activities (weekly)",
      value: weeklyActivitiesRecords.length,
      target: "12",
      ok: weeklyActivitiesRecords.length >= 12,
      records: weeklyActivitiesRecords.map((a) => ({
        id: a.id,
        name: a.summary || a.type || "Activity",
        status: `${a.type || "Activity"} • ${a.occurredAt ? new Date(a.occurredAt).toLocaleDateString() : "Undated"}`,
      })),
    },
    {
      key: "weekly-connectors",
      label: "New Connectors (weekly)",
      value: weeklyNewConnectorRecords.length,
      target: "3",
      ok: weeklyNewConnectorRecords.length >= 3,
      records: weeklyNewConnectorRecords.map((c) => ({
        id: `contact-${c.id}`,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unnamed contact",
        status: c.status || ((c.pipelineType || "connector") === "connector" ? "Identified" : "New"),
      })),
    },
    {
      key: "weekly-deals",
      label: "New deals (weekly)",
      value: newDealsThisWeek.length,
      target: "1",
      ok: newDealsThisWeek.length >= 1,
      records: newDealsThisWeek.map((d) => ({
        id: d.id,
        name: d.name || "Untitled deal",
        status: d.stage || "—",
      })),
    },
  ];

  const quarterlyLeadRecords = leadPeople.filter((c) => {
    const ms = new Date(c.createdAt || c.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= quarterStartMs;
  });
  const quarterlyDiscoveryRecords = (store.deals || []).filter((d) => {
    const ms = new Date(d.updatedAt || d.createdAt).getTime();
    return Number.isFinite(ms) && ms >= quarterStartMs && ["90-min disco completed", "Proposal / commitment", "Launch paid (won)"].includes(d.stage || "");
  });
  const quarterlyPipelineRecords = (store.deals || []).filter((d) => {
    const ms = new Date(d.createdAt || d.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= quarterStartMs && !["Launch paid (won)", "Lost"].includes(d.stage || "");
  });

  const quarterlyPipelineValue = quarterlyPipelineRecords.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const quarterlyItems = [
    {
      key: "quarterly-leads",
      label: "New Leads (quarterly)",
      value: quarterlyLeadRecords.length,
      target: "3",
      ok: quarterlyLeadRecords.length >= 3,
      records: quarterlyLeadRecords.map((c) => ({
        id: `qlead-${c.id}`,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unnamed contact",
        status: c.status || ((c.pipelineType || "connector") === "connector" ? "Identified" : "New"),
      })),
    },
    {
      key: "quarterly-discovery",
      label: "Discovery completed (quarterly)",
      value: quarterlyDiscoveryRecords.length,
      target: "2",
      ok: quarterlyDiscoveryRecords.length >= 2,
      records: quarterlyDiscoveryRecords.map((d) => ({
        id: `qdisc-${d.id}`,
        name: d.name || "Untitled deal",
        status: d.stage || "—",
      })),
    },
    {
      key: "quarterly-pipeline",
      label: "New pipeline (quarterly)",
      value: `$${Math.round(quarterlyPipelineValue / 1000)}K`,
      target: "$45K",
      ok: quarterlyPipelineValue >= 45000,
      records: quarterlyPipelineRecords.map((d) => ({
        id: `qpipe-${d.id}`,
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

      <section>
        <Link href="/crm/activities" className="crm-card block p-4 hover:-translate-y-0.5">
          <p className="text-sm font-semibold text-slate-300 inline-flex items-center gap-1.5">Status report from <span className={`${glyphMood.nameColor} inline-flex items-center gap-1`}>Sgt. Glyph <GlyphMoodIcon size={14} /></span></p>
          <p className={`mt-2 text-sm font-semibold ${glyphMood.color}`}>{glyphMood.statusLabel}</p>
          <p className="mt-1 text-slate-100">{glyphMood.text}</p>
        </Link>
      </section>

      <section className="crm-card p-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold"><CheckSquare size={18} /> KPI Scoreboard</h2>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Weekly</h3>
          <KpiScoreboard items={kpiItems} />
        </div>
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Quarterly</h3>
          <KpiScoreboard items={quarterlyItems} />
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card icon={<Users size={16} />} label="Connectors" value={connectorPeople.length} href="/crm/connectors" />
          <Card icon={<Users size={16} />} label="Leads" value={leadPeople.length} href="/crm/leads" />
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
          <li className="flex items-center justify-between"><span>Activated Connector → Intro Delivered</span><span className="font-semibold">{conversion.activatedToIntroDelivered}%</span></li>
          <li className="flex items-center justify-between"><span>Lead → Warm Intro</span><span className="font-semibold">{conversion.leadToWarmIntro}%</span></li>
          <li className="flex items-center justify-between"><span>Warm Intro → Discovery</span><span className="font-semibold">{conversion.warmIntroToDiscovery}%</span></li>
          <li className="flex items-center justify-between"><span>Discovery → Launch</span><span className="font-semibold">{conversion.discoveryToLaunch}%</span></li>
        </ul>
      </Link>

      <section className="crm-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold"><Crosshair size={18} /> Revenue Targets</h2>
          <Link href="/crm/settings" className="rounded border border-neutral-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-neutral-500">
            Change targets
          </Link>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Full exit target</p>
              <p className="mt-1 text-xl font-semibold text-slate-100">
                ${targets.revenueGoalAnnual.toLocaleString()} recurring by {targetDateLabel}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Based on ${targets.avgRevenuePerClientAnnual.toLocaleString()} per client and your saved conversion rates.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-800 px-3 py-2 text-right">
              <p className="text-xs text-slate-400">Target date</p>
              <p className="text-sm font-semibold text-slate-100">{targetDateLabel}</p>
              <p className="text-xs text-slate-500">{daysRemaining} days left</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <TargetCard
              label="Revenue"
              current={`$${annualizedRevenue.toLocaleString()}`}
              target={`$${targets.revenueGoalAnnual.toLocaleString()}`}
              progress={revenueProgressPct}
              subtext={`${activeClients} active clients closed so far`}
            />
            <TargetCard
              label="Clients needed"
              current={String(activeClients)}
              target={String(requiredClients)}
              progress={clientProgressPct}
              subtext={`${annualCloseTarget}/year pace to hit target`}
            />
            <TargetCard
              label="90-min discoveries needed"
              current={String(discoveryCount)}
              target={String(requiredDiscoveries)}
              progress={discoveryProgressPct}
              subtext={`${annualDiscoveryTarget}/year pace from current target date`}
            />
            <TargetCard
              label="Warm intros needed"
              current={String(warmIntrosYtd)}
              target={String(requiredWarmIntros)}
              progress={warmIntroProgressPct}
              subtext={`${annualWarmIntroTarget}/year pace from current target date`}
            />
            <TargetCard
              label="Leads needed"
              current={String(leadPeople.length)}
              target={String(requiredLeads)}
              progress={leadProgressPct}
              subtext={`${annualLeadTarget}/year pace from current target date`}
            />
          </div>

          <div className="mt-4 rounded-lg border border-neutral-800 p-3">
            <p className="text-sm font-semibold text-slate-200">Full exit math</p>
            <p className="mt-1 text-sm text-slate-400">
              To reach {requiredClients} clients by {targetDateLabel}, you need {requiredDiscoveries} 90-min discoveries, which means {requiredWarmIntros} warm intros, which means {requiredLeads} leads based on your saved conversion rates.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4 text-sm text-slate-300">
              <div className="rounded border border-neutral-800 px-3 py-2">Lead → Warm Intro <span className="float-right font-semibold">{targets.convLeadToWarmIntro}%</span></div>
              <div className="rounded border border-neutral-800 px-3 py-2">Warm Intro → Discovery <span className="float-right font-semibold">{targets.convWarmIntroToDiscovery}%</span></div>
              <div className="rounded border border-neutral-800 px-3 py-2">Discovery → Launch <span className="float-right font-semibold">{targets.convDiscoveryToLaunch}%</span></div>
              <div className="rounded border border-neutral-800 px-3 py-2">Avg annual/client <span className="float-right font-semibold">${targets.avgRevenuePerClientAnnual.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className={`rounded-lg border p-3 ${reducedHoursReady ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            <p className="text-sm font-semibold inline-flex items-center gap-2"><Medal size={16} /> Trigger 1 — Reduced Hours</p>
            <p className="text-xs text-slate-300 mt-1">Needs: {Math.max(4, Math.ceil(requiredClients * 0.6))} active clients + ~${Math.round((targets.revenueGoalAnnual * 0.67) / 1000)}k annualized.</p>
            <p className="mt-1 text-sm">Status: <span className="font-semibold">{reducedHoursReady ? "Ready" : "Not yet"}</span></p>
          </div>
          <div className={`rounded-lg border p-3 ${fullExitReady ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            <p className="text-sm font-semibold inline-flex items-center gap-2"><Trophy size={16} /> Trigger 2 — Full Exit</p>
            <p className="text-xs text-slate-300 mt-1">Needs: {requiredClients} clients + ${Math.round(targets.revenueGoalAnnual / 1000)}k recurring + 2+ potentials.</p>
            <p className="mt-1 text-sm">Status: <span className="font-semibold">{fullExitReady ? "Ready" : "Not yet"}</span></p>
          </div>
        </div>
      </section>

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

function TargetCard({ label, current, target, progress, subtext }: { label: string; current: string; target: string; progress: number; subtext: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-100">
        {current} <span className="text-sm font-medium text-slate-400">/ {target}</span>
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-500">{subtext}</span>
        <span className="font-semibold text-slate-300">{progress}%</span>
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
