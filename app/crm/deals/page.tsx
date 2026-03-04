"use client";

import { useEffect, useState } from "react";

const STAGES = ["Discovery meeting booked", "90-minute booked", "90-minute complete", "Verbal Yes", "Client signed (won)", "Lost"];

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ stage: STAGES[0] });
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [trayError, setTrayError] = useState("");

  const load = async () => {
    const d = await (await fetch("/api/crm/deals", { cache: "no-store" })).json();
    const c = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setDeals(d.deals || []);
    setContacts(c || []);
  };
  useEffect(() => {
    load();
  }, []);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : "—";
  };

  function openTray(deal: any) {
    setSelected(deal);
    setDraft({ ...deal });
    setEditMode(false);
    setTrayError("");
  }

  async function saveFromTray() {
    if (!draft) return;
    setTrayError("");
    const res = await fetch("/api/crm/deals", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setTrayError(j.error || "Could not save deal");
      return;
    }
    const fresh = await res.json();
    setSelected(fresh);
    setDraft(fresh);
    setEditMode(false);
    await load();
  }

  async function deleteFromTray() {
    if (!selected?.id) return;
    await fetch(`/api/crm/deals?id=${selected.id}`, { method: "DELETE" });
    setSelected(null);
    setDraft(null);
    setEditMode(false);
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deals</h1>
      <div className="crm-card p-4">
        <h2 className="font-semibold">Add deal</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <input placeholder="Deal name *" className="crm-input" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="crm-input" value={form.contactId || ""} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
            <option value="">Select linked contact *</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}
          </select>
          <select className="crm-input" value={form.stage || STAGES[0]} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="Value" type="number" className="crm-input" value={form.value || ""} onChange={(e) => setForm({ ...form, value: Number(e.target.value || 0) })} />
          <input placeholder="Probability %" type="number" className="crm-input" value={form.probability || ""} onChange={(e) => setForm({ ...form, probability: Number(e.target.value || 0) })} />
          <input type="date" className="crm-input" value={form.expectedCloseDate || ""} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
        </div>
        <input placeholder="Next step" className="crm-input mt-2" value={form.nextStep || ""} onChange={(e) => setForm({ ...form, nextStep: e.target.value })} />
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        <button className="crm-btn mt-2" onClick={async () => {
          setError("");
          const res = await fetch("/api/crm/deals", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
          if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || "Could not save deal"); return; }
          setForm({ stage: STAGES[0] });
          load();
        }}>Save deal</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STAGES.map((stage) => (
          <div key={stage} className="crm-card p-3">
            <h3 className="mb-3 font-semibold text-emerald-300">{stage}</h3>
            <div className="space-y-2">
              {deals.filter((d) => d.stage === stage).map((d) => (
                <button key={d.id} className="crm-card bg-neutral-950 w-full p-2 text-left" onClick={() => openTray(d)}>
                  <p className="font-medium">{d.name || "Untitled deal"}</p>
                  <p className="text-xs text-slate-400">${d.value || 0} · {d.probability || 0}%</p>
                  <p className="text-xs text-slate-500">{contactName(d.contactId)}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && draft && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setSelected(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{selected.name || "Untitled deal"}</h2>
              <button className="crm-btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>

            <div className="mt-4 flex gap-2">
              {!editMode ? (
                <button className="crm-btn" onClick={() => setEditMode(true)}>Edit</button>
              ) : (
                <>
                  <button className="crm-btn" onClick={saveFromTray}>Save</button>
                  <button className="crm-btn-ghost" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}>Cancel</button>
                </>
              )}
              <button className="crm-btn-ghost text-red-300" onClick={deleteFromTray}>Delete</button>
            </div>

            <div className="mt-5 space-y-3 overflow-auto pb-10">
              <Field label="Deal name" editMode={editMode}>
                <input className="crm-input" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <Field label="Linked contact" editMode={editMode} read={!editMode ? contactName(draft.contactId) : undefined}>
                <select className="crm-input" value={draft.contactId || ""} onChange={(e) => setDraft({ ...draft, contactId: e.target.value })}>
                  <option value="">Select linked contact *</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}
                </select>
              </Field>
              <Field label="Stage" editMode={editMode} read={draft.stage || "—"}>
                <select className="crm-input" value={draft.stage || STAGES[0]} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Value" editMode={editMode} read={draft.value ? `$${draft.value}` : "—"}>
                <input type="number" className="crm-input" value={draft.value || ""} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value || 0) })} />
              </Field>
              <Field label="Probability" editMode={editMode} read={draft.probability ? `${draft.probability}%` : "—"}>
                <input type="number" className="crm-input" value={draft.probability || ""} onChange={(e) => setDraft({ ...draft, probability: Number(e.target.value || 0) })} />
              </Field>
              <Field label="Expected close date" editMode={editMode} read={draft.expectedCloseDate || "—"}>
                <input type="date" className="crm-input" value={draft.expectedCloseDate || ""} onChange={(e) => setDraft({ ...draft, expectedCloseDate: e.target.value })} />
              </Field>
              <Field label="Next step" editMode={editMode} read={draft.nextStep || "—"}>
                <input className="crm-input" value={draft.nextStep || ""} onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })} />
              </Field>
              <Field label="Notes" editMode={editMode} read={draft.notes || "—"}>
                <textarea className="crm-input min-h-28" value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
              </Field>

              {trayError && <p className="text-sm text-red-300">{trayError}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, editMode, read, children }: { label: string; editMode: boolean; read?: string; children: React.ReactNode; }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{label}</label>
      {editMode ? children : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{read || "—"}</p>}
    </div>
  );
}
