"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, Save, Pencil, Trash2, X, CornerUpLeft, LayoutGrid, List } from "lucide-react";

const STAGES = ["Discovery meeting booked", "90-minute booked", "90-minute complete", "Verbal Yes", "Client signed (won)", "Lost"];
const stageLabel = (stage: string, idx: number) => `${idx + 1}. ${stage}`;

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ stage: STAGES[0] });
  const [error, setError] = useState("");
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [view, setView] = useState<"bucket" | "table">("bucket");
  const [sortBy, setSortBy] = useState<"createdAt" | "stage" | "company">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [trayError, setTrayError] = useState("");

  const load = async () => {
    const d = await (await fetch("/api/crm/deals", { cache: "no-store" })).json();
    const c = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setDeals(d.deals || []);
    setContacts(Array.isArray(c) ? c : c.contacts || []);
  };
  useEffect(() => { load(); }, []);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : "—";
  };

  async function moveDealStage(dealId: string, stage: string) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;
    await fetch("/api/crm/deals", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...deal, stage }),
    });
    await load();
  }


  const sortedDeals = useMemo(() => {
    const arr = [...deals];
    arr.sort((a, b) => {
      let va: any = "";
      let vb: any = "";
      if (sortBy === "createdAt") {
        va = new Date(a.createdAt || 0).getTime();
        vb = new Date(b.createdAt || 0).getTime();
      } else if (sortBy === "stage") {
        va = a.stage || "";
        vb = b.stage || "";
      } else {
        va = a.company || "";
        vb = b.company || "";
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [deals, sortBy, sortDir]);

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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold inline-flex items-center gap-2"><BriefcaseBusiness size={20} /> Deals</h1>
        <div className="inline-flex rounded-lg border border-neutral-700 p-1">
          <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")} title="Bucket view"><LayoutGrid size={16} /></button>
          <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")} title="Table view"><List size={16} /></button>
        </div>
      </div>
      <div className="crm-card p-4">
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Plus size={14} /> Add deal</span></h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <input placeholder="Deal name *" className="crm-input" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="crm-input" value={form.contactId || ""} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
            <option value="">Select linked contact *</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}
          </select>
          <select className="crm-input" value={form.stage || STAGES[0]} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {STAGES.map((s, i) => <option key={s} value={s}>{stageLabel(s, i)}</option>)}
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
        }}><span className="inline-flex items-center gap-1.5"><Save size={14} /> Save deal</span></button>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <select className="crm-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="createdAt">Sort: Created date</option>
          <option value="stage">Sort: Stage</option>
          <option value="company">Sort: Company</option>
        </select>
        <select className="crm-input" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}>
          <option value="desc">Newest / Z-A</option>
          <option value="asc">Oldest / A-Z</option>
        </select>
      </div>

      {view === "bucket" ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="crm-card p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async () => {
              if (!draggingDealId) return;
              await moveDealStage(draggingDealId, stage);
              setDraggingDealId(null);
            }}
          >
            <h3 className="mb-3 font-semibold text-emerald-300">{stageLabel(stage, STAGES.indexOf(stage))}</h3>
            <div className="space-y-2 min-h-10">
              {sortedDeals.filter((d) => d.stage === stage).map((d) => (
                <button
                  key={d.id}
                  draggable
                  onDragStart={() => setDraggingDealId(d.id)}
                  onDragEnd={() => setDraggingDealId(null)}
                  className="crm-card bg-neutral-950 w-full p-2 text-left cursor-grab active:cursor-grabbing"
                  onClick={() => openTray(d)}
                >
                  <p className="font-medium">{d.name || "Untitled deal"}</p>
                  <p className="text-xs text-slate-400">${d.value || 0} · {d.probability || 0}%</p>
                  <p className="text-xs text-slate-500">{contactName(d.contactId)}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="crm-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Deal</th>
                <th className="px-3 py-2 text-left">Contact</th>
                <th className="px-3 py-2 text-left">Company</th>
                <th className="px-3 py-2 text-left">Stage</th>
                <th className="px-3 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.map((d) => (
                <tr key={d.id} className="border-b border-neutral-900 hover:bg-neutral-900/60 cursor-pointer" onClick={() => openTray(d)}>
                  <td className="px-3 py-2">{d.name || "Untitled deal"}</td>
                  <td className="px-3 py-2 text-slate-300">{contactName(d.contactId)}</td>
                  <td className="px-3 py-2 text-slate-300">{d.company || "—"}</td>
                  <td className="px-3 py-2 text-emerald-300">{d.stage}</td>
                  <td className="px-3 py-2 text-slate-400">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && draft && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setSelected(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{selected.name || "Untitled deal"}</h2>
              <button className="crm-btn-ghost" onClick={() => setSelected(null)}><span className="inline-flex items-center gap-1.5"><X size={14} /> Close</span></button>
            </div>
            <div className="mt-4 flex gap-2">
              {!editMode ? <button className="crm-btn" onClick={() => setEditMode(true)}><span className="inline-flex items-center gap-1.5"><Pencil size={14} /> Edit</span></button> : <><button className="crm-btn" onClick={saveFromTray}><span className="inline-flex items-center gap-1.5"><Save size={14} /> Save</span></button><button className="crm-btn-ghost" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}><span className="inline-flex items-center gap-1.5"><CornerUpLeft size={14} /> Cancel</span></button></>}
              <button className="crm-btn-ghost text-red-300" onClick={deleteFromTray}><span className="inline-flex items-center gap-1.5"><Trash2 size={14} /> Delete</span></button>
            </div>
            <div className="mt-5 space-y-3 overflow-auto pb-10">
              <Field label="Deal name" editMode={editMode}><input className="crm-input" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
              <Field label="Linked contact" editMode={editMode} read={!editMode ? contactName(draft.contactId) : undefined}>
                <select className="crm-input" value={draft.contactId || ""} onChange={(e) => setDraft({ ...draft, contactId: e.target.value })}>
                  <option value="">Select linked contact *</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}
                </select>
              </Field>
              <Field label="Stage" editMode={editMode} read={draft.stage ? stageLabel(draft.stage, STAGES.indexOf(draft.stage)) : "—"}>
                <select className="crm-input" value={draft.stage || STAGES[0]} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}>
                  {STAGES.map((s, i) => <option key={s} value={s}>{stageLabel(s, i)}</option>)}
                </select>
              </Field>
              <Field label="Value" editMode={editMode} read={draft.value ? `$${draft.value}` : "—"}><input type="number" className="crm-input" value={draft.value || ""} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value || 0) })} /></Field>
              <Field label="Probability" editMode={editMode} read={draft.probability ? `${draft.probability}%` : "—"}><input type="number" className="crm-input" value={draft.probability || ""} onChange={(e) => setDraft({ ...draft, probability: Number(e.target.value || 0) })} /></Field>
              <Field label="Expected close date" editMode={editMode} read={draft.expectedCloseDate || "—"}><input type="date" className="crm-input" value={draft.expectedCloseDate || ""} onChange={(e) => setDraft({ ...draft, expectedCloseDate: e.target.value })} /></Field>
              <Field label="Next step" editMode={editMode} read={draft.nextStep || "—"}><input className="crm-input" value={draft.nextStep || ""} onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })} /></Field>
              <Field label="Notes" editMode={editMode} read={draft.notes || "—"}><textarea className="crm-input min-h-28" value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
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
