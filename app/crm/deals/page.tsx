"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, Save, Pencil, Trash2, X, CornerUpLeft, LayoutGrid, List } from "lucide-react";

const STAGES = ["Discovery meeting booked", "90-minute booked", "90-minute complete", "Verbal Yes", "Client signed (won)", "Lost"];
const stageLabel = (stage: string, idx: number) => `${idx + 1}. ${stage}`;

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [view, setView] = useState<"bucket" | "table">("table");

  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [trayError, setTrayError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState<any>(null);

  const load = async () => {
    const d = await (await fetch("/api/crm/deals", { cache: "no-store" })).json();
    const c = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setDeals(d.deals || []);
    setContacts(Array.isArray(c) ? c : c.contacts || []);
  };
  useEffect(() => { load(); }, []);

  const sortedDeals = useMemo(() => [...deals], [deals]);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : "—";
  };


  function startInlineEdit(d: any) { setEditingId(d.id); setInlineDraft({ ...d }); }
  function cancelInlineEdit() { setEditingId(null); setInlineDraft(null); }
  async function saveInlineEdit() {
    if (!inlineDraft) return;
    const res = await fetch('/api/crm/deals', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(inlineDraft) });
    if (!res.ok) return;
    await load();
    cancelInlineEdit();
  }

  function openCreate() { setCreateMode(true); setEditMode(true); setSelected(null); setDraft({ stage: STAGES[0] }); setTrayError(""); }
  function openTray(deal: any) { setSelected(deal); setDraft({ ...deal }); setEditMode(false); setCreateMode(false); setTrayError(""); }
  function closeTray() { setSelected(null); setDraft(null); setEditMode(false); setCreateMode(false); setTrayError(""); }

  async function moveDealStage(dealId: string, stage: string) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;
    await fetch("/api/crm/deals", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...deal, stage }) });
    await load();
  }

  async function saveDeal() {
    if (!draft) return;
    setTrayError("");
    const isCreate = createMode;
    const res = await fetch("/api/crm/deals", { method: isCreate ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setTrayError(j.error || "Could not save deal"); return; }
    const fresh = await res.json();
    await load();
    setSelected(fresh); setDraft(fresh); setCreateMode(false); setEditMode(false);
  }

  async function deleteFromTray() {
    if (!selected?.id) return;
    await fetch(`/api/crm/deals?id=${selected.id}`, { method: "DELETE" });
    closeTray();
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-amber-200 whitespace-nowrap"><BriefcaseBusiness size={20} /> Deals ({deals.length})</h1>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 font-semibold text-white hover:bg-amber-600" onClick={openCreate}><Plus size={14} /> New</button>
          <div className="inline-flex rounded-lg border border-neutral-700 p-1">
            <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")}><LayoutGrid size={16} /></button>
            <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")}><List size={16} /></button>
          </div>
        </div>
      </div>

      

      {view === "bucket" ? (
        <div className="overflow-x-auto pb-2"><div className="flex gap-4 min-w-max">
          {STAGES.map((stage) => (
            <div key={stage} className="crm-card p-3 w-[320px] shrink-0" onDragOver={(e) => e.preventDefault()} onDrop={async () => { if (!draggingDealId) return; await moveDealStage(draggingDealId, stage); setDraggingDealId(null); }}>
              <h3 className="mb-3 font-semibold text-emerald-300">{stageLabel(stage, STAGES.indexOf(stage))}</h3>
              <div className="space-y-2 min-h-10">
                {sortedDeals.filter((d) => d.stage === stage).map((d) => (
                  <button key={d.id} draggable onDragStart={() => setDraggingDealId(d.id)} onDragEnd={() => setDraggingDealId(null)} className="crm-card bg-neutral-950 w-full p-2 text-left cursor-grab" onClick={() => openTray(d)}>
                    <p className="font-medium">{d.name || "Untitled deal"}</p>
                    <p className="text-xs text-slate-400">${d.value || 0} · {d.probability || 0}%</p>
                    <p className="text-xs text-slate-500">{contactName(d.contactId)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div></div>
      ) : (
        <div className="crm-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left">Deal</th><th className="px-3 py-2 text-left">Contact</th><th className="px-3 py-2 text-left">Company</th><th className="px-3 py-2 text-left">Stage</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
            <tbody>
              {sortedDeals.map((d) => {
                const editing = editingId === d.id;
                return (
                  <tr key={d.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
                    <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(d)}>{editing ? <input className="crm-input" value={inlineDraft.name || ""} onChange={(e)=>setInlineDraft({...inlineDraft, name:e.target.value})} /> : (d.name || "Untitled deal")}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(d)}>{editing ? <select className="crm-input" value={inlineDraft.contactId || ""} onChange={(e)=>setInlineDraft({...inlineDraft, contactId:e.target.value})}><option value="">Select linked contact *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</select> : contactName(d.contactId)}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(d)}>{editing ? <input className="crm-input" value={inlineDraft.company || ""} onChange={(e)=>setInlineDraft({...inlineDraft, company:e.target.value})} /> : (d.company || "—")}</td>
                    <td className="px-3 py-2 text-emerald-300" onClick={() => !editing && startInlineEdit(d)}>{editing ? <select className="crm-input" value={inlineDraft.stage || STAGES[0]} onChange={(e)=>setInlineDraft({...inlineDraft, stage:e.target.value})}>{STAGES.map((s)=><option key={s} value={s}>{s}</option>)}</select> : d.stage}</td>
                    <td className="px-3 py-2 text-slate-400">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2">{editing ? <div className="flex gap-2"><button className="crm-btn-ghost" onClick={saveInlineEdit}>Save</button><button className="crm-btn-ghost" onClick={cancelInlineEdit}>Cancel</button></div> : <button className="crm-btn-ghost" onClick={() => openTray(d)}>Open</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={closeTray} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{createMode ? "New deal" : selected?.name || "Untitled deal"}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex gap-2">
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" onClick={() => setEditMode(true)}><Pencil size={14} /> Edit</button> : <><button className="crm-btn inline-flex items-center gap-1.5" onClick={saveDeal}><Save size={14} /> Save</button>{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}><CornerUpLeft size={14} /> Cancel</button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" onClick={() => { if (!confirm("Are you sure you want to delete this record?")) return; deleteFromTray(); }}><Trash2 size={14} /> Delete</button>}
            </div>
            <div className="mt-5 space-y-3 overflow-auto pb-10">
              <Field label="Deal name" editMode={editMode || createMode}><input className="crm-input" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
              <Field label="Linked contact" editMode={editMode || createMode} read={!(editMode || createMode) ? contactName(draft.contactId) : undefined}><select className="crm-input" value={draft.contactId || ""} onChange={(e) => setDraft({ ...draft, contactId: e.target.value })}><option value="">Select linked contact *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}</select></Field>
              <Field label="Stage" editMode={editMode || createMode} read={draft.stage ? stageLabel(draft.stage, STAGES.indexOf(draft.stage)) : "—"}><select className="crm-input" value={draft.stage || STAGES[0]} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}>{STAGES.map((s, i) => <option key={s} value={s}>{stageLabel(s, i)}</option>)}</select></Field>
              <Field label="Value" editMode={editMode || createMode} read={draft.value ? `$${draft.value}` : "—"}><input type="number" className="crm-input" value={draft.value || ""} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value || 0) })} /></Field>
              <Field label="Probability" editMode={editMode || createMode} read={draft.probability ? `${draft.probability}%` : "—"}><input type="number" className="crm-input" value={draft.probability || ""} onChange={(e) => setDraft({ ...draft, probability: Number(e.target.value || 0) })} /></Field>
              <Field label="Expected close date" editMode={editMode || createMode} read={draft.expectedCloseDate || "—"}><input type="date" className="crm-input" value={draft.expectedCloseDate || ""} onChange={(e) => setDraft({ ...draft, expectedCloseDate: e.target.value })} /></Field>
              <Field label="Next step" editMode={editMode || createMode} read={draft.nextStep || "—"}><input className="crm-input" value={draft.nextStep || ""} onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })} /></Field>
              <Field label="Notes" editMode={editMode || createMode} read={draft.notes || "—"}><textarea className="crm-input min-h-28" value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
              {error && <p className="text-sm text-red-300">{error}</p>}
              {trayError && <p className="text-sm text-red-300">{trayError}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, editMode, read, children }: { label: string; editMode: boolean; read?: string; children: React.ReactNode; }) {
  return <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{label}</label>{editMode ? children : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{read || "—"}</p>}</div>;
}
