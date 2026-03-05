"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, Save, Pencil, Trash2, X, CornerUpLeft, LayoutGrid, List, Archive } from "lucide-react";

const STAGES = ["Discovery meeting booked", "Discovery meeting completed", "Fit meeting booked", "Fit meeting completed", "Proposal / commitment", "Launch paid (won)", "Lost"];
const CLIENT_STAGES = ["Launch", "Active rhythm"];
const PRIMARY_PAIN_OPTIONS = ["Execution", "Strategy", "Culture"];
const stageLabel = (stage: string, idx: number) => `${idx + 1}. ${stage}`;
const money = (n?: number) => `$${Math.round(Number(n || 0)).toLocaleString()}`;
const openPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
  el.showPicker?.();
};

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [dealStamps, setDealStamps] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<string | null>(null);
  const [hoverDrop, setHoverDrop] = useState<{ stage: string; index: number } | null>(null);
  const [view, setView] = useState<"bucket" | "table">("bucket");

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
    setDealStamps(d.dealStamps || []);
    setContacts(Array.isArray(c) ? c : c.contacts || []);
  };
  useEffect(() => { load(); }, []);

  const visibleDeals = useMemo(() => deals.filter((d) => d.stage !== "Launch paid (won)" && d.stage !== "Lost"), [deals]);
  const sortedDeals = useMemo(() => [...visibleDeals], [visibleDeals]);

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

  function openCreate() { setCreateMode(true); setEditMode(true); setSelected(null); setDraft({ stage: STAGES[0], dailyRate: 5000, launchIncluded: "Yes" }); setTrayError(""); }
  function openTray(deal: any) { setSelected(deal); setDraft({ ...deal }); setEditMode(false); setCreateMode(false); setTrayError(""); }
  function closeTray() { setSelected(null); setDraft(null); setEditMode(false); setCreateMode(false); setTrayError(""); }

  const stageWeight = (stage: string) => stage === "Discovery meeting booked" ? 10 : stage === "Discovery meeting completed" ? 15 : stage === "Fit meeting booked" ? 25 : stage === "Fit meeting completed" ? 35 : stage === "Proposal / commitment" ? 50 : stage === "Launch paid (won)" ? 100 : 0;

  async function moveDealStage(dealId: string, stage: string, targetIndex?: number) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;

    // Optimistic move for immediate/smooth drop feedback
    setDeals((prev) => {
      const moving = prev.find((d) => d.id === dealId);
      if (!moving) return prev;
      const others = prev.filter((d) => d.id !== dealId);
      const updated = { ...moving, stage, probability: stageWeight(stage) };
      if (targetIndex === undefined) return [...others, updated];

      const next: any[] = [];
      let stageCount = 0;
      let inserted = false;
      for (const d of others) {
        if (d.stage === stage && stageCount === targetIndex) {
          next.push(updated);
          inserted = true;
        }
        next.push(d);
        if (d.stage === stage) stageCount++;
      }
      if (!inserted) next.push(updated);
      return next;
    });

    await fetch("/api/crm/deals", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...deal, stage }) });
    await load();
  }

  async function removeDealStamp(stampId: string) {
    if (!confirm("Remove this won-deal placeholder?")) return;
    await fetch(`/api/crm/deals?stampId=${encodeURIComponent(stampId)}`, { method: "DELETE" });
    await load();
  }

  async function saveDeal() {
    if (!draft) return;
    setTrayError("");
    const isCreate = createMode;
    const res = await fetch("/api/crm/deals", { method: isCreate ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setTrayError(j.error || "Could not save deal"); return; }
    await load();
    closeTray();
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
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-amber-200 whitespace-nowrap"><BriefcaseBusiness size={20} /> Deals ({visibleDeals.length})</h1>
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
            <div key={stage} className={`crm-card p-3 w-[240px] shrink-0 transition-all duration-150 ${hoverStage === stage ? "ring-2 ring-emerald-500/80 border-emerald-500/70" : ""}`} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setHoverStage(stage)} onDragLeave={() => setHoverStage((s) => s === stage ? null : s)} onDrop={async () => { if (!draggingDealId) return; await moveDealStage(draggingDealId, stage); setDraggingDealId(null); setHoverStage(null); setHoverDrop(null); }}>
              <h3 className="mb-3 font-semibold text-emerald-300">{stageLabel(stage, STAGES.indexOf(stage))}</h3>
              <div className="min-h-10">
                {(() => {
                  const stageDeals = sortedDeals.filter((d) => d.stage === stage);
                  return (
                    <>
                      {stageDeals.map((d, idx) => (
                        <div key={d.id}>
                          <div
                            className={`my-1 h-1 rounded-full transition-all ${hoverDrop?.stage === stage && hoverDrop.index === idx ? "bg-emerald-400" : "bg-transparent"}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setHoverDrop({ stage, index: idx })}
                            onDrop={async () => { if (!draggingDealId) return; await moveDealStage(draggingDealId, stage, idx); setDraggingDealId(null); setHoverStage(null); setHoverDrop(null); }}
                          />
                          <button draggable onDragStart={() => setDraggingDealId(d.id)} onDragEnd={() => { setDraggingDealId(null); setHoverStage(null); setHoverDrop(null); }} className={`crm-card bg-neutral-950 w-full min-w-0 p-2 text-left cursor-grab transition-all duration-150 ${draggingDealId === d.id ? "scale-[1.02] opacity-70" : ""}`} onClick={() => openTray(d)}>
                            <p className="truncate font-medium">{d.name || "Untitled deal"}</p>
                            <p className="truncate text-xs text-slate-400">Amount: {money(d.value)} · {d.probability || 0}%</p>
                            <p className="truncate text-xs text-slate-500">{contactName(d.contactId)}</p>
                          </button>
                        </div>
                      ))}
                      <div
                        className={`mt-1 h-1 rounded-full transition-all ${hoverDrop?.stage === stage && hoverDrop.index === stageDeals.length ? "bg-emerald-400" : "bg-transparent"}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => setHoverDrop({ stage, index: stageDeals.length })}
                        onDrop={async () => { if (!draggingDealId) return; await moveDealStage(draggingDealId, stage, stageDeals.length); setDraggingDealId(null); setHoverStage(null); setHoverDrop(null); }}
                      />
                    </>
                  );
                })()}
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

      {(dealStamps.length > 0 || deals.some((d) => d.stage === "Lost")) && (
        <div className="space-y-4">
          {dealStamps.length > 0 && (
            <div className="crm-card p-4">
              <h3 className="mb-3 inline-flex items-center gap-2 font-semibold text-slate-200"><Archive size={16} /> Past Wins</h3>
              <div className="space-y-2">
                {dealStamps.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{s.name || "Untitled deal"} <span className="text-emerald-300">• {money(s.value)}</span></p>
                      <p className="text-xs text-slate-400">{s.company || "—"} · won {s.wonAt ? new Date(s.wonAt).toLocaleDateString() : "—"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="crm-btn-ghost inline-flex items-center gap-1" onClick={() => { const deal = deals.find((d) => d.id === s.dealId); if (deal) openTray(deal); }}>Open</button>
                      <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1" onClick={() => removeDealStamp(s.id)}><Trash2 size={13} /> Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deals.some((d) => d.stage === "Lost") && (
            <div className="crm-card p-4">
              <h3 className="mb-3 inline-flex items-center gap-2 font-semibold text-slate-200"><Archive size={16} /> Past Loses</h3>
              <div className="space-y-2">
                {deals.filter((d) => d.stage === "Lost").map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{d.name || "Untitled deal"} <span className="text-rose-300">• {money(d.value)}</span></p>
                      <p className="text-xs text-slate-400">{d.company || "—"} · lost {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : "—"}</p>
                    </div>
                    <button className="crm-btn-ghost inline-flex items-center gap-1" onClick={() => openTray(d)}>Open</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={closeTray} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{createMode ? "New deal" : selected?.name || "Untitled deal"}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex gap-2">
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" onClick={() => setEditMode(true)}><Pencil size={14} /> Edit</button> : <><button className="crm-btn inline-flex items-center gap-1.5" onClick={saveDeal}><Save size={14} /> Save</button>{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}><CornerUpLeft size={14} /> Cancel</button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" onClick={() => { if (!confirm("Are you sure you want to delete this record?")) return; deleteFromTray(); }}><Trash2 size={14} /> Delete</button>}
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              <Field label="Deal name" editMode={editMode || createMode}><input className="crm-input" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
              <Field label="Linked contact" editMode={editMode || createMode} read={!(editMode || createMode) ? contactName(draft.contactId) : undefined}><select className="crm-input" value={draft.contactId || ""} onChange={(e) => setDraft({ ...draft, contactId: e.target.value })}><option value="">Select linked contact *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}</select></Field>
              <Field label="Stage" editMode={editMode || createMode} read={draft.stage ? stageLabel(draft.stage, STAGES.indexOf(draft.stage)) : "—"}><select className="crm-input" value={draft.stage || STAGES[0]} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}>{STAGES.map((s, i) => <option key={s} value={s}>{stageLabel(s, i)}</option>)}</select></Field>
              <Field label="Client stage" editMode={editMode || createMode} read={draft.clientStage || "—"}><select className="crm-input" value={draft.clientStage || ""} onChange={(e) => setDraft({ ...draft, clientStage: e.target.value || undefined })}><option value="">Not set</option>{CLIENT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
              <Field label="Primary pain" editMode={editMode || createMode} read={draft.primaryPain || "—"}><select className="crm-input" value={draft.primaryPain || ""} onChange={(e) => setDraft({ ...draft, primaryPain: e.target.value || undefined })}><option value="">Not set</option>{PRIMARY_PAIN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}</select></Field>
              <Field label="Lead source" editMode={editMode || createMode} read={draft.leadSource || "—"}><input className="crm-input" value={draft.leadSource || ""} onChange={(e) => setDraft({ ...draft, leadSource: e.target.value })} /></Field>
              <Field label="Launch included" editMode={editMode || createMode} read={draft.launchIncluded || "Yes"}><select className="crm-input" value={draft.launchIncluded || "Yes"} onChange={(e) => setDraft({ ...draft, launchIncluded: e.target.value })}><option value="Yes">Yes</option><option value="No">No</option></select></Field>
              <Field label="Daily rate" editMode={editMode || createMode} read={money(draft.dailyRate || 5000)}><input type="number" className="crm-input" value={draft.dailyRate || 5000} onChange={(e) => setDraft({ ...draft, dailyRate: Number(e.target.value || 5000) })} /></Field>
              <Field label="Launch fee" editMode={false} read={money((draft.launchIncluded || "Yes") === "Yes" ? (draft.dailyRate || 5000) * 3 : 0)}><span /></Field>
              <Field label="Annual fee" editMode={false} read={money((draft.dailyRate || 5000) * 5)}><span /></Field>
              <Field label="Amount" editMode={false} read={money((((draft.launchIncluded || "Yes") === "Yes" ? 3 : 0) + 5) * (draft.dailyRate || 5000))}><span /></Field>
              <Field label="Stage weight" editMode={false} read={draft.probability !== undefined ? `${draft.probability}%` : "—"}><span /></Field>
              <Field label="Expected close date" editMode={editMode || createMode} read={draft.expectedCloseDate || "—"}><input type="date" className="crm-input" value={draft.expectedCloseDate || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, expectedCloseDate: e.target.value })} /></Field>
              <Field label="Launch Day 1" editMode={editMode || createMode} read={draft.launchDay1Date || "—"}><input type="date" className="crm-input" value={draft.launchDay1Date || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, launchDay1Date: e.target.value })} /></Field>
              <Field label="Launch Day 2" editMode={editMode || createMode} read={draft.launchDay2Date || "—"}><input type="date" className="crm-input" value={draft.launchDay2Date || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, launchDay2Date: e.target.value })} /></Field>
              <Field label="Launch Day 3" editMode={editMode || createMode} read={draft.launchDay3Date || "—"}><input type="date" className="crm-input" value={draft.launchDay3Date || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, launchDay3Date: e.target.value })} /></Field>
              <Field label="Next quarterly date" editMode={editMode || createMode} read={draft.nextQuarterlyDate || "—"}><input type="date" className="crm-input" value={draft.nextQuarterlyDate || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, nextQuarterlyDate: e.target.value })} /></Field>
              <Field label="Next annual Day 1" editMode={editMode || createMode} read={draft.nextAnnualDay1Date || "—"}><input type="date" className="crm-input" value={draft.nextAnnualDay1Date || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, nextAnnualDay1Date: e.target.value })} /></Field>
              <Field label="Next annual Day 2" editMode={editMode || createMode} read={draft.nextAnnualDay2Date || "—"}><input type="date" className="crm-input" value={draft.nextAnnualDay2Date || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, nextAnnualDay2Date: e.target.value })} /></Field>
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
