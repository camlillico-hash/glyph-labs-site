"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Save, Pencil, Trash2, X, SquareArrowOutUpRight, LayoutGrid, List, Archive, ChevronDown, ChevronRight } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

const STAGES = ["Warm intro booked", "Warm intro completed", "90-min disco booked", "90-min disco completed", "Proposal / commitment", "Launch days paid", "Lost"];
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
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<string | null>(null);
  const [hoverDrop, setHoverDrop] = useState<{ stage: string; index: number } | null>(null);
  const [view, setView] = useState<"bucket" | "table">("table");

  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [trayError, setTrayError] = useState("");
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; action: (() => void) | null }>({ open: false, message: "", action: null });
  const [movePicker, setMovePicker] = useState<{ open: boolean; dealId?: string }>({ open: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState<any>(null);
  const [showOpenDeals, setShowOpenDeals] = useState(true);
  const [showWon, setShowWon] = useState(true);
  const [showLost, setShowLost] = useState(true);

  const load = async () => {
    const d = await (await fetch("/api/crm/deals", { cache: "no-store" })).json();
    const c = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setDeals(d.deals || []);
    setDealStamps(d.dealStamps || []);
    setContacts(Array.isArray(c) ? c : c.contacts || []);
    setActivities(await (await fetch('/api/crm/activities', { cache: 'no-store' })).json());
    setTasks((await (await fetch('/api/crm/tasks', { cache: 'no-store' })).json()).tasks || []);
  };
  useEffect(() => { load(); }, []);

  const visibleDeals = useMemo(() => deals.filter((d) => !["Launch days paid", "Launch paid (won)", "Lost"].includes(d.stage)), [deals]);
  const sortedDeals = useMemo(() => [...visibleDeals], [visibleDeals]);
  const lostDeals = useMemo(() => deals.filter((d) => d.stage === "Lost"), [deals]);

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

  function openTray(deal: any) { setSelected(deal); setDraft({ ...deal }); setEditMode(false); setCreateMode(false); setTrayError(""); }
  function closeTray() { setSelected(null); setDraft(null); setEditMode(false); setCreateMode(false); setTrayError(""); }

  const stageWeight = (stage: string) => stage === "Warm intro booked" ? 10 : stage === "Warm intro completed" ? 15 : stage === "90-min disco booked" ? 25 : stage === "90-min disco completed" ? 35 : stage === "Proposal / commitment" ? 50 : stage === "Launch days paid" ? 100 : 0;

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
    askConfirm("Remove this won-deal placeholder?", async () => {
      await fetch(`/api/crm/deals?stampId=${encodeURIComponent(stampId)}`, { method: "DELETE" });
      await load();
    });
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

  function askConfirm(message: string, action: () => void) {
    setConfirmState({ open: true, message, action });
  }

  async function deleteFromTray() {
    if (!selected?.id) return;
    await fetch(`/api/crm/deals?id=${selected.id}`, { method: "DELETE" });
    closeTray();
    await load();
  }

  const renderDealsTable = (rows: any[]) => (
    <div className="crm-card overflow-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left">Deal</th><th className="px-3 py-2 text-left">Contact</th><th className="px-3 py-2 text-left">Company</th><th className="px-3 py-2 text-left">Amount</th><th className="px-3 py-2 text-left">Stage</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
        <tbody>
          {rows.map((d) => {
            const editing = editingId === d.id;
            return (
              <tr key={d.id} className="border-b border-neutral-900 hover:bg-neutral-900/60" onDoubleClick={() => startInlineEdit(d)}>
                <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(d)}>{editing ? <input className="crm-input" value={inlineDraft.name || ""} onChange={(e)=>setInlineDraft({...inlineDraft, name:e.target.value})} /> : <button className="font-medium text-sky-300 hover:text-sky-200" onClick={(e)=>{e.stopPropagation(); openTray(d);}}>{d.name || "Untitled deal"}</button>}</td>
                <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(d)}>{editing ? <select className="crm-input" value={inlineDraft.contactId || ""} onChange={(e)=>setInlineDraft({...inlineDraft, contactId:e.target.value})}><option value="">Select linked contact *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</select> : (d.contactId ? <a className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} href={`/crm/contacts?contactId=${d.contactId}`}>{contactName(d.contactId)}</a> : "—")}</td>
                <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(d)}>{editing ? <input className="crm-input" value={inlineDraft.company || ""} onChange={(e)=>setInlineDraft({...inlineDraft, company:e.target.value})} /> : (d.company || "—")}</td>
                <td className="px-3 py-2 text-slate-300">{money(d.value)}</td>
                <td className="px-3 py-2 text-emerald-300" onClick={() => !editing && startInlineEdit(d)}>{editing ? <select className="crm-input" value={inlineDraft.stage || STAGES[0]} onChange={(e)=>setInlineDraft({...inlineDraft, stage:e.target.value})}>{STAGES.map((s)=><option key={s} value={s}>{s}</option>)}</select> : d.stage}</td>
                <td className="px-3 py-2 text-slate-400">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">{editing ? <div className="flex gap-2"><button className="crm-btn-ghost" title="Save" aria-label="Save" onClick={saveInlineEdit}><Save size={14} className="text-emerald-300" /></button><button className="crm-btn-ghost" title="Cancel" aria-label="Cancel" onClick={cancelInlineEdit}><X size={14} className="text-rose-300" /></button></div> : <button className="crm-btn-ghost" title="Open tray" aria-label="Open tray" onClick={() => openTray(d)}><SquareArrowOutUpRight size={14} /></button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-amber-200 whitespace-nowrap" style={{ fontFamily: "var(--font-playfair-display), serif" }}><BriefcaseBusiness size={20} /> Deals</h1>
        <div className="flex items-center gap-2">
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
              <h3 className="mb-3 inline-flex items-center gap-1.5 font-semibold text-emerald-300">
                {stageLabel(stage, STAGES.indexOf(stage))}
                <span className="rounded-full border border-neutral-700 bg-neutral-900 px-1.5 py-0.5 text-[10px] text-slate-300">
                  {sortedDeals.filter((d) => d.stage === stage).length}
                </span>
              </h3>
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
                            <p className="truncate text-xs text-slate-500">{d.contactId ? <a className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} href={`/crm/contacts?contactId=${d.contactId}`}>{contactName(d.contactId)}</a> : "—"}</p>
                            <button type="button" className="mt-2 inline-flex md:hidden rounded border border-neutral-700 px-2 py-1 text-[11px] text-slate-300" onClick={(e) => { e.stopPropagation(); setMovePicker({ open: true, dealId: d.id }); }}>
                              Move
                            </button>
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
        <div className="space-y-2">
          <button className="inline-flex items-center gap-2 text-left text-base sm:text-xl font-bold text-amber-200" style={{ fontFamily: "var(--font-playfair-display), serif" }} onClick={() => setShowOpenDeals((v) => !v)}>
            {showOpenDeals ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            Open deals ({visibleDeals.length})
          </button>
          {showOpenDeals && renderDealsTable(sortedDeals)}
        </div>
      )}

      {(dealStamps.length > 0 || deals.some((d) => d.stage === "Lost")) && (
        <div className="space-y-4">
          {dealStamps.length > 0 && (
            <div className="space-y-2">
              <button className="inline-flex items-center gap-2 text-left text-base sm:text-xl font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }} onClick={() => setShowWon((v) => !v)}>
                {showWon ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                Won ({dealStamps.length})
              </button>
              {showWon && (
                <div className="crm-card overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left">Deal</th><th className="px-3 py-2 text-left">Contact</th><th className="px-3 py-2 text-left">Company</th><th className="px-3 py-2 text-left">Amount</th><th className="px-3 py-2 text-left">Stage</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
                    <tbody>
                      {dealStamps.map((s) => {
                        const linkedDeal = deals.find((d) => d.id === s.dealId);
                        return (
                          <tr key={s.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
                            <td className="px-3 py-2">{s.name || "Untitled deal"}</td>
                            <td className="px-3 py-2 text-slate-300">{linkedDeal?.contactId ? <a className="text-sky-300 hover:text-sky-200" href={`/crm/contacts?contactId=${linkedDeal.contactId}`}>{contactName(linkedDeal.contactId)}</a> : "—"}</td>
                            <td className="px-3 py-2 text-slate-300">{s.company || "—"}</td>
                            <td className="px-3 py-2 text-slate-300">{money(s.value)}</td>
                            <td className="px-3 py-2 text-emerald-300">Launch days paid</td>
                            <td className="px-3 py-2 text-slate-400">{s.wonAt ? new Date(s.wonAt).toLocaleDateString() : "—"}</td>
                            <td className="px-3 py-2"><div className="flex gap-2"><button className="crm-btn-ghost inline-flex items-center gap-1" title="Open tray" aria-label="Open tray" onClick={() => { if (linkedDeal) openTray(linkedDeal); }}><SquareArrowOutUpRight size={14} /></button><button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1" title="Remove" aria-label="Remove" onClick={() => removeDealStamp(s.id)}><Trash2 size={13} /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {lostDeals.length > 0 && (
            <div className="space-y-2">
              <button className="inline-flex items-center gap-2 text-left text-base sm:text-xl font-bold text-amber-300" style={{ fontFamily: "var(--font-playfair-display), serif" }} onClick={() => setShowLost((v) => !v)}>
                {showLost ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                Lost ({lostDeals.length})
              </button>
              {showLost && renderDealsTable(lostDeals)}
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
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" title="Open" aria-label="Open" onClick={() => setEditMode(true)}><Pencil size={14} /></button> : <><button className="crm-btn inline-flex items-center gap-1.5" title="Save" aria-label="Save" onClick={saveDeal}><Save size={14} className="text-emerald-300" /></button>{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" title="Cancel" aria-label="Cancel" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}><X size={14} className="text-rose-300" /></button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" title="Delete" aria-label="Delete" onClick={() => askConfirm("Are you sure you want to delete this record?", () => { deleteFromTray(); })}><Trash2 size={14} /></button>}
            </div>
            <div
              className="mt-5 min-h-0 flex-1 space-y-3 overflow-auto pb-10"
              onDoubleClick={() => {
                if (!editMode && !createMode) setEditMode(true);
              }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Contact details</h3>
              <Field label="Deal name" editMode={editMode || createMode}><input className="crm-input" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
              <Field label="Company" editMode={editMode || createMode} read={!(editMode || createMode) ? (draft.company || "—") : undefined}><input className="crm-input" value={draft.company || ""} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></Field>
              <Field label="Linked contact" editMode={editMode || createMode} read={!(editMode || createMode) ? (draft.contactId ? <a className="text-sky-300 hover:text-sky-200" href={`/crm/contacts?contactId=${draft.contactId}`}>{contactName(draft.contactId)}</a> : "—") : undefined}><select className="crm-input" value={draft.contactId || ""} onChange={(e) => setDraft({ ...draft, contactId: e.target.value })}><option value="">Select linked contact *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}</select></Field>
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

              {!createMode && (
                <>
                  <h3 className="pt-2 text-sm font-semibold uppercase tracking-wider text-slate-300">Activities</h3>
                  <div className="rounded-xl border border-neutral-800 p-3">
                    {activities.filter((a:any) => a.contactId === draft.contactId).length > 0 ? (
                      <div className="space-y-2">
                        {activities.filter((a:any) => a.contactId === draft.contactId).slice(0,8).map((a:any) => (
                          <div key={a.id} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
                            <p className="font-medium text-slate-200">{a.type || 'activity'}</p>
                            <p className="text-slate-400">{new Date(a.occurredAt || a.createdAt).toLocaleString()}</p>
                            <p className="text-slate-300">{a.note || '—'}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-slate-500">No activities yet.</p>}
                  </div>

                  <h3 className="pt-2 text-sm font-semibold uppercase tracking-wider text-slate-300">Associated deals</h3>
                  <div className="rounded-xl border border-neutral-800 p-3">
                    {deals.filter((x:any) => x.contactId === draft.contactId).length > 0 ? (
                      <div className="space-y-2">
                        {deals.filter((x:any) => x.contactId === draft.contactId).map((x:any) => (
                          <button key={x.id} className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-sm hover:bg-neutral-800" onClick={() => openTray(x)}>
                            <span className="font-medium text-slate-100">{x.name || 'Untitled deal'}</span>
                            <span className="ml-2 text-slate-400">• {x.stage || '—'}</span>
                          </button>
                        ))}
                      </div>
                    ) : <p className="text-xs text-slate-500">No associated deals.</p>}
                  </div>

                  <h3 className="pt-2 text-sm font-semibold uppercase tracking-wider text-slate-300">Completed tasks</h3>
                  <div className="rounded-xl border border-neutral-800 p-3">
                    {tasks.filter((t:any) => ((t.relatedType === 'deal' && t.relatedId === draft.id) || (t.relatedType === 'contact' && t.relatedId === draft.contactId)) && (t.status === 'Completed' || t.done)).length > 0 ? (
                      <div className="space-y-2">
                        {tasks.filter((t:any) => ((t.relatedType === 'deal' && t.relatedId === draft.id) || (t.relatedType === 'contact' && t.relatedId === draft.contactId)) && (t.status === 'Completed' || t.done)).map((t:any) => (
                          <div key={t.id} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
                            <p className="font-medium text-slate-200">{t.title || 'Task'}</p>
                            <p className="text-slate-400">{t.type || 'task'}{t.dueDate ? ` • ${t.dueDate}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-slate-500">No completed tasks.</p>}
                  </div>
                </>
              )}
              {error && <p className="text-sm text-red-300">{error}</p>}
              {trayError && <p className="text-sm text-red-300">{trayError}</p>}
            </div>
          </aside>
        </div>
      )}

      {movePicker.open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMovePicker({ open: false })} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Move deal to stage</h3>
            <div className="mt-3 grid gap-2">
              {STAGES.map((s) => (
                <button key={s} className="crm-btn-ghost text-left" onClick={async () => { if (!movePicker.dealId) return; await moveDealStage(movePicker.dealId, s); setMovePicker({ open: false }); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        confirmLabel="Delete"
        onCancel={() => setConfirmState({ open: false, message: "", action: null })}
        onConfirm={() => {
          const action = confirmState.action;
          setConfirmState({ open: false, message: "", action: null });
          action?.();
        }}
      />
    </div>
  );
}

function Field({ label, editMode, read, children }: { label: string; editMode: boolean; read?: React.ReactNode; children: React.ReactNode; }) {
  return <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{label}</label>{editMode ? children : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{read || "—"}</p>}</div>;
}
