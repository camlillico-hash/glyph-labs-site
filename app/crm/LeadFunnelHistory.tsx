"use client";

import { useMemo, useState } from "react";
import type { LeadStageEvent } from "@/lib/crm-store";

const STAGES = ["New", "Attempting", "Connected", "Warm intro booked"] as const;
type Lead = { id: string; leadSource?: string };
type CohortLead = { contactId: string; month: string; source: string; enteredAt: number; reached: Map<string, number> };

function medianDays(values: number[]) {
  if (!values.length) return "—";
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return `${median < 10 ? median.toFixed(1) : Math.round(median)}d`;
}

function percent(count: number, total: number) {
  return total ? `${Math.round((count / total) * 100)}%` : "—";
}

export default function LeadFunnelHistory({ contacts, events }: { contacts: Lead[]; events: LeadStageEvent[] }) {
  const [source, setSource] = useState("All sources");
  const [month, setMonth] = useState("All months");
  const contactById = useMemo(() => new Map(contacts.map((contact) => [contact.id, contact])), [contacts]);
  const cohorts = useMemo(() => {
    const byId = new Map<string, CohortLead>();
    for (const event of [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))) {
      if (!contactById.has(event.contactId)) continue;
      const timestamp = Date.parse(event.occurredAt);
      if (!Number.isFinite(timestamp)) continue;
      if (event.kind === "created") {
        if (!byId.has(event.contactId)) {
          byId.set(event.contactId, {
            contactId: event.contactId,
            month: event.occurredAt.slice(0, 7),
            source: contactById.get(event.contactId)?.leadSource || event.leadSource || "Unspecified",
            enteredAt: timestamp,
            reached: new Map(),
          });
        }
      }
      const lead = byId.get(event.contactId);
      if (lead && !lead.reached.has(event.toStatus)) lead.reached.set(event.toStatus, timestamp);
    }
    return [...byId.values()];
  }, [contactById, events]);

  const sources = useMemo(() => ["All sources", ...new Set(contacts.map((lead) => lead.leadSource || "Unspecified"))].sort((a, b) => a === "All sources" ? -1 : b === "All sources" ? 1 : a.localeCompare(b)), [contacts]);
  const months = useMemo(() => ["All months", ...new Set(cohorts.map((lead) => lead.month))].sort((a, b) => a === "All months" ? -1 : b === "All months" ? 1 : b.localeCompare(a)), [cohorts]);
  const matchingSource = cohorts.filter((lead) => source === "All sources" || lead.source === source);
  const selected = matchingSource.filter((lead) => month === "All months" || lead.month === month);
  const baselineEvents = events.filter((event) => event.kind === "baseline" && contactById.has(event.contactId) && (source === "All sources" || (contactById.get(event.contactId)?.leadSource || event.leadSource || "Unspecified") === source));
  const legacyCount = new Set(baselineEvents.map((event) => event.contactId)).size;
  const baselineIds = new Set(baselineEvents.map((event) => event.contactId));
  const newlyConnected = new Set(events.filter((event) => baselineIds.has(event.contactId) && event.kind === "transition" && event.toStatus === "Connected").map((event) => event.contactId)).size;
  const newlyBooked = new Set(events.filter((event) => baselineIds.has(event.contactId) && event.kind === "transition" && event.toStatus === "Warm intro booked").map((event) => event.contactId)).size;

  function reachedCount(leads: CohortLead[], stage: string) {
    return stage === "New" ? leads.length : leads.filter((lead) => lead.reached.has(stage)).length;
  }

  function stageVelocity(leads: CohortLead[], stage: string, previous: string) {
    const days = leads.flatMap((lead) => {
      const end = lead.reached.get(stage);
      const start = previous === "New" ? lead.enteredAt : lead.reached.get(previous);
      return end !== undefined && start !== undefined && end >= start ? [(end - start) / 86_400_000] : [];
    });
    return medianDays(days);
  }

  function entryToWarmIntro(leads: CohortLead[]) {
    return medianDays(leads.flatMap((lead) => {
      const reachedAt = lead.reached.get("Warm intro booked");
      return reachedAt !== undefined && reachedAt >= lead.enteredAt ? [(reachedAt - lead.enteredAt) / 86_400_000] : [];
    }));
  }

  return (
    <section className="crm-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Lead funnel over time</h2>
          <p className="mt-1 text-xs text-slate-400">Cohorts by the month leads entered the CRM. Rates show the share that reached each stage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="text-xs text-slate-400">Lead source<br /><select className="crm-input mt-1" value={source} onChange={(event) => setSource(event.target.value)}>{sources.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs text-slate-400">Cohort month<br /><select className="crm-input mt-1" value={month} onChange={(event) => setMonth(event.target.value)}>{months.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{selected.length} tracked lead{selected.length === 1 ? "" : "s"} in this view</p>
      {legacyCount > 0 && <p className="mt-1 text-xs text-slate-400">Existing leads at tracking start: {legacyCount}. Since then, {newlyConnected} newly reached Connected and {newlyBooked} newly booked a warm intro{source !== "All sources" ? ` for ${source}` : ""}.</p>}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-b border-neutral-700 text-left text-slate-400"><tr><th className="py-2">Stage reached</th><th className="py-2 text-right">Leads</th><th className="py-2 text-right">Of cohort</th><th className="py-2 text-right">Median from prior stage</th></tr></thead>
          <tbody>{STAGES.map((stage, index) => <tr key={stage} className="border-b border-neutral-800"><td className="py-2">{stage}</td><td className="py-2 text-right">{reachedCount(selected, stage)}</td><td className="py-2 text-right">{percent(reachedCount(selected, stage), selected.length)}</td><td className="py-2 text-right">{index ? stageVelocity(selected, stage, STAGES[index - 1]) : "—"}</td></tr>)}</tbody>
        </table>
      </div>
      {month === "All months" && matchingSource.length > 0 && <div className="mt-5 overflow-x-auto"><h3 className="mb-2 text-sm font-semibold">By entry month</h3><table className="w-full min-w-[640px] text-sm"><thead className="border-b border-neutral-700 text-left text-slate-400"><tr><th className="py-2">Month</th><th className="py-2 text-right">Leads</th><th className="py-2 text-right">Attempting</th><th className="py-2 text-right">Connected</th><th className="py-2 text-right">Warm intro</th><th className="py-2 text-right">Median to warm intro</th></tr></thead><tbody>{months.filter((item) => item !== "All months").map((entryMonth) => { const group = matchingSource.filter((lead) => lead.month === entryMonth); return group.length ? <tr key={entryMonth} className="border-b border-neutral-800"><td className="py-2">{entryMonth}</td><td className="py-2 text-right">{group.length}</td><td className="py-2 text-right">{percent(reachedCount(group, "Attempting"), group.length)}</td><td className="py-2 text-right">{percent(reachedCount(group, "Connected"), group.length)}</td><td className="py-2 text-right">{percent(reachedCount(group, "Warm intro booked"), group.length)}</td><td className="py-2 text-right">{entryToWarmIntro(group)}</td></tr> : null; })}</tbody></table></div>}
      <p className="mt-4 text-xs text-slate-500">Tracking begins when stage history was added. {legacyCount} existing lead{legacyCount === 1 ? " has" : "s have"} a current-stage baseline; earlier transitions cannot be recovered and are excluded from cohort rates. Recent cohorts have had less time to convert.</p>
    </section>
  );
}
