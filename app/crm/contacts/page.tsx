"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Save, Pencil, Trash2, X, CornerUpLeft, LayoutGrid, List, Plus, Upload, Archive, Mail } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import Papa from "papaparse";

type Contact = any;
const CONTACT_STAGES = ["New", "Attempting", "Connected", "Discovery meeting booked", "Not right now"];
const CONTACT_TYPES = ["Influencer", "Decision maker", "Networker", "Other"];
const PRIMARY_PAIN_OPTIONS = ["Execution", "Strategy", "Culture"];
const DISQUALIFICATION_REASONS = ["Couldn't connect", "Went cold", "Said no", "Not the right person", "Other"];
const WHAT_NOW_OPTIONS = ["Leave them", "Nurture (future)"];
const contactFields: Array<[string, string, string]> = [
  ["firstName", "First name", "text"], ["lastName", "Last name", "text"], ["email", "Email", "email"],
  ["phone", "Phone", "text"],
  ["linkedin", "LinkedIn", "text"], ["company", "Company", "text"], ["title", "Title", "text"], ["type", "Type", "select"], ["primaryPain", "Primary pain", "select"], ["leadSource", "Lead source", "text"],
];
const stageLabel = (stage: string, idx: number) => `${idx + 1}. ${stage}`;
const prettyType = (v?: string) => String(v || "").split("_").map((s) => s ? s[0].toUpperCase() + s.slice(1) : s).join(" ");
const openPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
  el.showPicker?.();
};
const gmailComposeUrl = (email?: string) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(String(email || ""))}`;

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [gmail, setGmail] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [contactStamps, setContactStamps] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activityDraft, setActivityDraft] = useState<any>({ type: "email" });
  const [activityError, setActivityError] = useState("");
  const [draggingContactId, setDraggingContactId] = useState<string | null>(null);
  const [hoverStatus, setHoverStatus] = useState<string | null>(null);
  const [hoverDrop, setHoverDrop] = useState<{ status: string; index: number } | null>(null);
  const [view, setView] = useState<"bucket" | "table">("table");

  const [selected, setSelected] = useState<Contact | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [trayError, setTrayError] = useState("");
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; action: (() => void) | null }>({ open: false, message: "", action: null });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState<any>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState("");

  const load = async () => {
    const contactsRes = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setItems(Array.isArray(contactsRes) ? contactsRes : contactsRes.contacts || []);
    setContactStamps(Array.isArray(contactsRes) ? [] : contactsRes.contactStamps || []);
    setGmail(await (await fetch("/api/crm/gmail/messages", { cache: "no-store" })).json());
    setTasks((await (await fetch("/api/crm/tasks", { cache: "no-store" })).json()).tasks || []);
    setActivities(await (await fetch("/api/crm/activities", { cache: "no-store" })).json());
  };
  useEffect(() => { load(); }, []);

  const openItems = useMemo(() => items.filter((c) => (c.status || "New") !== "Discovery meeting booked" && (c.status || "New") !== "Not right now"), [items]);
  const sorted = useMemo(() => [...openItems], [openItems]);


  const selectedActivities = useMemo(() => {
    if (!selected?.id) return [];
    return (activities || [])
      .filter((a: any) => a.contactId === selected.id)
      .sort((a: any, b: any) => new Date(b.occurredAt || b.createdAt).getTime() - new Date(a.occurredAt || a.createdAt).getTime());
  }, [activities, selected]);

  function openCreate() { setCreateMode(true); setEditMode(true); setSelected(null); setDraft({ status: "New" }); setTrayError(""); setActivityDraft({ type: "email", occurredAtLocal: "" }); setActivityError(""); }
  function openTray(contact: Contact) { setSelected(contact); setDraft({ ...contact }); setEditMode(false); setCreateMode(false); setTrayError(""); setActivityDraft({ type: "email", contactId: contact.id, occurredAtLocal: "" }); setActivityError(""); }
  function closeTray() { setSelected(null); setDraft(null); setEditMode(false); setCreateMode(false); setTrayError(""); }

  function startInlineEdit(c: any) { setEditingId(c.id); setInlineDraft({ ...c }); }
  function cancelInlineEdit() { setEditingId(null); setInlineDraft(null); }
  async function saveInlineEdit() {
    if (!inlineDraft) return;
    const res = await fetch('/api/crm/contacts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(inlineDraft) });
    if (!res.ok) return;
    await load();
    cancelInlineEdit();
  }

  async function moveContactStage(contactId: string, status: string, targetIndex?: number) {
    const contact = items.find((c) => c.id === contactId);
    if (!contact || (contact.status || "New") === status) return;
    setItems((prev) => {
      const moving = prev.find((c) => c.id === contactId);
      if (!moving) return prev;
      const others = prev.filter((c) => c.id !== contactId);
      const updated = { ...moving, status };
      if (targetIndex === undefined) return [...others, updated];

      const next: any[] = [];
      let statusCount = 0;
      let inserted = false;
      for (const c of others) {
        if ((c.status || "New") === status && statusCount === targetIndex) {
          next.push(updated);
          inserted = true;
        }
        next.push(c);
        if ((c.status || "New") === status) statusCount++;
      }
      if (!inserted) next.push(updated);
      return next;
    });
    await fetch("/api/crm/contacts", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...contact, status }) });
    await load();
  }

  async function saveContact(createAnother = false) {
    if (!draft) return;
    setTrayError("");
    const isCreate = createMode;
    const res = await fetch("/api/crm/contacts", { method: isCreate ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setTrayError(j.error || "Could not save contact"); return; }
    await load();
    if (isCreate && createAnother) { setDraft({ status: "New" }); setCreateMode(true); setEditMode(true); return; }
    closeTray();
  }

  async function deleteFromTray() {
    if (!selected?.id) return;
    await fetch(`/api/crm/contacts?id=${selected.id}`, { method: "DELETE" });
    closeTray();
    await load();
  }

  function askConfirm(message: string, action: () => void) {
    setConfirmState({ open: true, message, action });
  }

  async function removeContactStamp(stampId: string) {
    askConfirm("Remove this won-contact placeholder?", async () => {
      await fetch(`/api/crm/contacts?stampId=${encodeURIComponent(stampId)}`, { method: "DELETE" });
      await load();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-sky-200 whitespace-nowrap"><Users size={20} /> Contacts ({sorted.length})</h1>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-2 font-semibold text-white hover:bg-sky-600" onClick={openCreate}><Plus size={14} /> New</button>
          <button title="Import CSV" aria-label="Import CSV" className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => { setImportOpen(true); setImportError(""); setImportResult(null); }}><Upload size={14} /></button>
          <div className="inline-flex rounded-lg border border-neutral-700 p-1">
            <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")}><LayoutGrid size={16} /></button>
            <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")}><List size={16} /></button>
          </div>
        </div>
      </div>

      

      {view === "bucket" ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {CONTACT_STAGES.map((stage, i) => (
              <div key={stage} className={`crm-card p-3 w-[240px] shrink-0 transition-all duration-150 ${hoverStatus === stage ? "ring-2 ring-emerald-500/80 border-emerald-500/70" : ""}`} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setHoverStatus(stage)} onDragLeave={() => setHoverStatus((s) => s === stage ? null : s)} onDrop={async () => { if (!draggingContactId) return; await moveContactStage(draggingContactId, stage); setDraggingContactId(null); setHoverStatus(null); setHoverDrop(null); }}>
                <h3 className="mb-3 font-semibold text-emerald-300">{stageLabel(stage, i)}</h3>
                <div className="min-h-10">
                  {(() => {
                    const stageContacts = sorted.filter((c) => (c.status || "New") === stage);
                    return (
                      <>
                        {stageContacts.map((c, idx) => (
                          <div key={c.id}>
                            <div
                              className={`my-1 h-1 rounded-full transition-all ${hoverDrop?.status === stage && hoverDrop.index === idx ? "bg-emerald-400" : "bg-transparent"}`}
                              onDragOver={(e) => e.preventDefault()}
                              onDragEnter={() => setHoverDrop({ status: stage, index: idx })}
                              onDrop={async () => { if (!draggingContactId) return; await moveContactStage(draggingContactId, stage, idx); setDraggingContactId(null); setHoverStatus(null); setHoverDrop(null); }}
                            />
                            <button draggable onDragStart={() => setDraggingContactId(c.id)} onDragEnd={() => { setDraggingContactId(null); setHoverStatus(null); setHoverDrop(null); }} className={`crm-card w-full min-w-0 p-3 text-left cursor-grab transition-all duration-150 ${draggingContactId === c.id ? "scale-[1.02] opacity-70" : ""}`} onClick={() => openTray(c)}>
                              <p className="truncate font-semibold">{c.firstName} {c.lastName}</p>
                              <p className="truncate text-xs text-slate-400 inline-flex items-center gap-1.5">{c.email || "No email"}{c.email && <a href={gmailComposeUrl(c.email)} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} title="Compose email"><Mail size={12} /></a>}</p>
                              {c.linkedin && <p className="truncate text-xs text-slate-400">{c.linkedin}</p>}
                              <p className="truncate text-xs text-slate-500">{c.company || "No company"}</p>
                              <p className="truncate text-xs text-slate-500">Type: {c.type || "—"}</p>
                              <p className="mt-1 truncate text-[11px] text-emerald-300">Gmail: {c.email ? gmail.filter((m) => `${m.from || ""} ${m.to || ""}`.toLowerCase().includes(String(c.email).toLowerCase())).length : 0}</p>
                              <button type="button" className="mt-2 inline-flex md:hidden rounded border border-neutral-700 px-2 py-1 text-[11px] text-slate-300" onClick={(e) => { e.stopPropagation(); const next = prompt(`Move to status (${CONTACT_STAGES.join(', ')})`, c.status || "New"); if (!next) return; moveContactStage(c.id, next); }}>
                                Move
                              </button>
                            </button>
                          </div>
                        ))}
                        <div
                          className={`mt-1 h-1 rounded-full transition-all ${hoverDrop?.status === stage && hoverDrop.index === stageContacts.length ? "bg-emerald-400" : "bg-transparent"}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={() => setHoverDrop({ status: stage, index: stageContacts.length })}
                          onDrop={async () => { if (!draggingContactId) return; await moveContactStage(draggingContactId, stage, stageContacts.length); setDraggingContactId(null); setHoverStatus(null); setHoverDrop(null); }}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="crm-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">LinkedIn</th><th className="px-3 py-2 text-left">Company</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Stage</th><th className="px-3 py-2 text-left">Last Activity Date</th><th className="px-3 py-2 text-left">Last Activity Type</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
            <tbody>
              {sorted.map((c) => {
                const editing = editingId === c.id;
                return (
                  <tr key={c.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
                    <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(c)}>{editing ? <div className="grid grid-cols-2 gap-1"><input className="crm-input" value={inlineDraft.firstName || ""} onChange={(e)=>setInlineDraft({...inlineDraft, firstName:e.target.value})} /><input className="crm-input" value={inlineDraft.lastName || ""} onChange={(e)=>setInlineDraft({...inlineDraft, lastName:e.target.value})} /></div> : `${c.firstName} ${c.lastName}`}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.email || ""} onChange={(e)=>setInlineDraft({...inlineDraft, email:e.target.value})} /> : (c.email ? <span className="inline-flex items-center gap-1.5">{c.email}<a href={gmailComposeUrl(c.email)} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} title="Compose email"><Mail size={13} /></a></span> : "—")}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.linkedin || ""} onChange={(e)=>setInlineDraft({...inlineDraft, linkedin:e.target.value})} /> : (c.linkedin ? <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center" onClick={(e)=>e.stopPropagation()}><img src="https://cdn-icons-png.flaticon.com/512/2496/2496097.png" alt="LinkedIn" className="h-4 w-4" /></a> : "—")}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.company || ""} onChange={(e)=>setInlineDraft({...inlineDraft, company:e.target.value})} /> : (c.company || "—")}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <select className="crm-input" value={inlineDraft.type || ""} onChange={(e)=>setInlineDraft({...inlineDraft, type:e.target.value})}><option value="">Select type</option>{CONTACT_TYPES.map((t)=> <option key={t} value={t}>{t}</option>)}</select> : (c.type || "—")}</td>
                    <td className="px-3 py-2 text-emerald-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <select className="crm-input" value={inlineDraft.status || "New"} onChange={(e)=>setInlineDraft({...inlineDraft, status:e.target.value})}>{CONTACT_STAGES.map((s)=> <option key={s} value={s}>{s}</option>)}</select> : (c.status || "New")}</td>
                    <td className="px-3 py-2 text-slate-300">{c.lastActivityDate ? new Date(c.lastActivityDate).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2 text-slate-300">{c.lastActivityType ? prettyType(String(c.lastActivityType)) : "—"}</td>
                    <td className="px-3 py-2 text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2">{editing ? <div className="flex gap-2"><button className="crm-btn-ghost" title="Save" aria-label="Save" onClick={saveInlineEdit}><Save size={14} className="text-emerald-300" /></button><button className="crm-btn-ghost" title="Cancel" aria-label="Cancel" onClick={cancelInlineEdit}><X size={14} className="text-rose-300" /></button></div> : <button className="crm-btn-ghost" title="Open" aria-label="Open" onClick={() => openTray(c)}><Pencil size={14} /></button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(contactStamps.length > 0 || items.some((c) => (c.status || "New") === "Not right now")) && (
        <div className="space-y-4">
          {contactStamps.length > 0 && (
            <div className="crm-card p-4">
              <h3 className="mb-3 inline-flex items-center gap-2 font-semibold text-slate-200"><Archive size={16} /> Past Wins</h3>
              <div className="space-y-2">
                {contactStamps.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{s.name || "Unnamed contact"}</p>
                      <p className="text-xs text-slate-400">{s.email || "—"} · {s.company || "—"} · won {s.wonAt ? new Date(s.wonAt).toLocaleDateString() : "—"}</p>
                    </div>
                    <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1" onClick={() => removeContactStamp(s.id)}><Trash2 size={13} /> Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.some((c) => (c.status || "New") === "Not right now") && (
            <div className="crm-card p-4">
              <h3 className="mb-3 inline-flex items-center gap-2 font-semibold text-slate-200"><Archive size={16} /> Past Leads</h3>
              <div className="space-y-2">
                {items.filter((c) => (c.status || "New") === "Not right now").map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-400">{c.email || "—"} · {c.company || "—"}</p>
                      <p className="mt-1 text-xs text-slate-300">Reason: {c.disqualificationReason || "—"}</p>
                      <p className="text-xs text-slate-300">What now: {c.whatNow || "—"}</p>
                      <p className="text-xs text-slate-300">Nurture due: {tasks.find((t) => t.followUpKind === "nurture_reactivate" && t.followUpForContactId === c.id && t.status !== "Completed" && t.status !== "Canceled")?.dueDate || "—"}</p>
                    </div>
                    <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1" title="Delete" aria-label="Delete" onClick={() => askConfirm("Delete this past lead contact?", async () => { await fetch(`/api/crm/contacts?id=${c.id}`, { method: "DELETE" }); await load(); })}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {importOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setImportOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Import contacts from CSV</h2>
              <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => setImportOpen(false)}><X size={14} /> Close</button>
            </div>
            <p className="mt-2 text-sm text-slate-400">Headers supported: firstName,lastName,email,phone,company,title,type,primaryPain,leadSource,status,notes</p>
            <div className="mt-4">
              <input
                type="file"
                accept=".csv,text/csv"
                className="crm-input"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImportError("");
                  setImportResult(null);
                  const text = await file.text();
                  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
                  if (parsed.errors?.length) {
                    setImportError(parsed.errors[0].message || "CSV parse error");
                    return;
                  }
                  const rows = parsed.data as any[];
                  const res = await fetch('/api/crm/contacts/import', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ rows }),
                  });
                  const j = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setImportError(j.error || 'Import failed');
                    return;
                  }
                  setImportResult(j);
                  await load();
                }}
              />
            </div>

            {importError && <p className="mt-3 text-sm text-red-300">{importError}</p>}
            {importResult && (
              <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm">
                <p className="text-emerald-300">Created: {importResult.created} · Skipped: {importResult.skipped}</p>
                {importResult.errors?.length > 0 && (
                  <div className="mt-2 max-h-56 overflow-auto text-xs text-slate-300">
                    {importResult.errors.map((er: any, i: number) => <p key={i}>Row {er.row}: {er.reason}</p>)}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-40"><div className="absolute inset-0 bg-black/55" onClick={closeTray} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{createMode ? "New contact" : `${selected?.firstName || ""} ${selected?.lastName || ""}`}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex gap-2">
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" title="Open" aria-label="Open" onClick={() => setEditMode(true)}><Pencil size={14} /></button> : <><button className="crm-btn inline-flex items-center gap-1.5" title="Save" aria-label="Save" onClick={() => saveContact(false)}><Save size={14} className="text-emerald-300" /></button>{createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" title="Save" aria-label="Save" onClick={() => saveContact(true)}><Save size={14} className="text-emerald-300" /></button>}{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" title="Cancel" aria-label="Cancel" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}><X size={14} className="text-rose-300" /></button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" title="Delete" aria-label="Delete" onClick={() => askConfirm("Are you sure you want to delete this record?", () => { deleteFromTray(); })}><Trash2 size={14} /></button>}
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              {contactFields.map(([k, label, type]) => (
                <div key={k}>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{label}</label>
                  {(editMode || createMode) ? (
                    k === "type" ? (
                      <select className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}>
                        <option value="">Select type</option>
                        {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : k === "primaryPain" ? (
                      <select className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value || undefined })}>
                        <option value="">Select primary pain</option>
                        {PRIMARY_PAIN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : (
                      <input type={type === "select" ? "text" : type} className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                    )
                  ) : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft[k] || "—"}</p>}
                </div>
              ))}
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Lead stage</label>{(editMode || createMode) ? <select className="crm-input" value={draft.status || "New"} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>{CONTACT_STAGES.map((s, i) => <option key={s} value={s}>{stageLabel(s, i)}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.status || "New"}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Disqualification reason{(editMode || createMode) && (draft.status === "Not right now") ? " *" : ""}</label>{(editMode || createMode) ? <select className="crm-input" value={draft.disqualificationReason || ""} onChange={(e) => setDraft({ ...draft, disqualificationReason: e.target.value || undefined })}><option value="">Select reason</option>{DISQUALIFICATION_REASONS.map((s) => <option key={s} value={s}>{s}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.disqualificationReason || "—"}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">What now?{(editMode || createMode) && (draft.status === "Not right now") ? " *" : ""}</label>{(editMode || createMode) ? <select className="crm-input" value={draft.whatNow || ""} onChange={(e) => setDraft({ ...draft, whatNow: e.target.value || undefined })}><option value="">Select next path</option>{WHAT_NOW_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.whatNow || "—"}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Notes</label>{(editMode || createMode) ? <textarea className="crm-input min-h-28" value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{draft.notes || "—"}</p>}</div>

              {!createMode && (
                <div className="rounded-xl border border-neutral-800 p-3">
                  <h3 className="mb-2 text-sm font-semibold text-slate-200">Log activity</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <select className="crm-input" value={activityDraft.type || "email"} onChange={(e) => setActivityDraft({ ...activityDraft, type: e.target.value, contactId: selected.id })}>
                      <option value="email">Email</option>
                      <option value="call">Call</option>
                      <option value="text">Text</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="in_person">In person</option>
                      <option value="meeting">Meeting</option>
                    </select>
                    <input type="datetime-local" className="crm-input" value={activityDraft.occurredAtLocal || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setActivityDraft({ ...activityDraft, occurredAtLocal: e.target.value, contactId: selected.id })} />
                  </div>
                  <textarea className="crm-input mt-2" placeholder="Activity note" value={activityDraft.note || ""} onChange={(e) => setActivityDraft({ ...activityDraft, note: e.target.value, contactId: selected.id })} />
                  {activityError && <p className="mt-2 text-sm text-red-300">{activityError}</p>}
                  <button className="crm-btn mt-2" onClick={async () => {
                    setActivityError("");
                    const res = await fetch('/api/crm/activities', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...activityDraft, contactId: selected.id, occurredAt: activityDraft.occurredAtLocal ? new Date(activityDraft.occurredAtLocal).toISOString() : undefined }) });
                    if (!res.ok) { const j = await res.json().catch(() => ({})); setActivityError(j.error || 'Could not log activity'); return; }
                    setActivityDraft({ type: "email", contactId: selected.id, note: "", occurredAtLocal: "" });
                    setActivities(await (await fetch('/api/crm/activities', { cache: 'no-store' })).json());
                  }}>Save activity</button>

                  <div className="mt-3 space-y-2">
                    {selectedActivities.map((a: any) => (
                      <div key={a.id} className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-emerald-300">{String(a.type).replace('_', ' ')}</span>
                          <span className="text-slate-400">{new Date(a.occurredAt || a.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-slate-300">{a.note || "—"}</p>
                      </div>
                    ))}
                    {selectedActivities.length === 0 && <p className="text-xs text-slate-500">No activities yet.</p>}
                  </div>
                </div>
              )}

              {trayError && <p className="text-sm text-red-300">{trayError}</p>}
            </div>
          </aside>
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
