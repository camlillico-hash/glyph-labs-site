"use client";

import { useEffect, useState } from "react";

const STAGES = ["Discovery meeting booked", "90-minute booked", "90-minute complete", "Verbal Yes", "Client signed (won)", "Lost"];

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ stage: STAGES[0] });

  const load = async () => {
    const d = await (await fetch('/api/crm/deals', { cache: 'no-store' })).json();
    const c = await (await fetch('/api/crm/contacts', { cache: 'no-store' })).json();
    setDeals(d.deals || []); setContacts(c || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deals</h1>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="font-semibold">Add deal</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <input placeholder="Deal name" className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5" value={form.contactId || ''} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
            <option value="">No contact linked</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ''}</option>)}
          </select>
          <select className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5" value={form.stage || STAGES[0]} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="Value" type="number" className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5" value={form.value || ''} onChange={(e) => setForm({ ...form, value: Number(e.target.value || 0) })} />
          <input placeholder="Probability %" type="number" className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5" value={form.probability || ''} onChange={(e) => setForm({ ...form, probability: Number(e.target.value || 0) })} />
          <input type="date" className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5" value={form.expectedCloseDate || ''} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
        </div>
        <input placeholder="Next step" className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5" value={form.nextStep || ''} onChange={(e) => setForm({ ...form, nextStep: e.target.value })} />
        <button className="mt-2 rounded bg-[#036734] px-3 py-1.5" onClick={async () => { await fetch('/api/crm/deals', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) }); setForm({ stage: STAGES[0] }); load(); }}>Save deal</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STAGES.map((stage) => (
          <div key={stage} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
            <h3 className="mb-3 font-semibold text-emerald-300">{stage}</h3>
            <div className="space-y-2">
              {deals.filter((d) => d.stage === stage).map((d) => (
                <div key={d.id} className="rounded-xl border border-neutral-700 bg-neutral-950 p-2">
                  <p className="font-medium">{d.name || "Untitled deal"}</p>
                  <p className="text-xs text-slate-400">${d.value || 0} · {d.probability || 0}%</p>
                  <select className="mt-2 w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs" value={d.stage}
                    onChange={async (e) => { await fetch('/api/crm/deals', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, stage: e.target.value }) }); load(); }}>
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button className="mt-2 text-xs text-red-300" onClick={async () => { await fetch(`/api/crm/deals?id=${d.id}`, { method: 'DELETE' }); load(); }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
