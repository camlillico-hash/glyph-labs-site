"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Save, Pencil, Trash2, X, CornerUpLeft, LayoutGrid, List, Plus } from "lucide-react";

type Contact = any;
const CONTACT_STAGES = ["New", "Attempting", "Connected", "Discovery meeting booked", "Not right now"];
const CONTACT_TYPES = ["Influencer", "Decision maker", "Networker", "Other"];
const contactFields: Array<[string, string, string]> = [
  ["firstName", "First name", "text"], ["lastName", "Last name", "text"], ["email", "Email", "email"],
  ["phone", "Phone", "text"], ["company", "Company", "text"], ["title", "Title", "text"], ["type", "Type", "select"], ["leadSource", "Lead source", "text"],
];
const stageLabel = (stage: string, idx: number) => `${idx + 1}. ${stage}`;

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [gmail, setGmail] = useState<any[]>([]);
  const [draggingContactId, setDraggingContactId] = useState<string | null>(null);
  const [view, setView] = useState<"bucket" | "table">("table");
  const [sortBy, setSortBy] = useState<"createdAt" | "status" | "company">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [selected, setSelected] = useState<Contact | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [trayError, setTrayError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState<any>(null);

  const load = async () => {
    const contactsRes = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setItems(Array.isArray(contactsRes) ? contactsRes : contactsRes.contacts || []);
    setGmail(await (await fetch("/api/crm/gmail/messages", { cache: "no-store" })).json());
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((c) => (`${c.firstName || ""} ${c.lastName || ""} ${c.email || ""} ${c.company || ""}`).toLowerCase().includes(query.toLowerCase())), [items, query]);
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: any = "", vb: any = "";
      if (sortBy === "createdAt") { va = new Date(a.createdAt || 0).getTime(); vb = new Date(b.createdAt || 0).getTime(); }
      else if (sortBy === "status") { va = a.status || ""; vb = b.status || ""; }
      else { va = a.company || ""; vb = b.company || ""; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  function openCreate() { setCreateMode(true); setEditMode(true); setSelected(null); setDraft({ status: "New" }); setTrayError(""); }
  function openTray(contact: Contact) { setSelected(contact); setDraft({ ...contact }); setEditMode(false); setCreateMode(false); setTrayError(""); }
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

  async function moveContactStage(contactId: string, status: string) {
    const contact = items.find((c) => c.id === contactId);
    if (!contact || (contact.status || "New") === status) return;
    await fetch("/api/crm/contacts", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...contact, status }) });
    await load();
  }

  async function saveContact(createAnother = false) {
    if (!draft) return;
    setTrayError("");
    const isCreate = createMode;
    const res = await fetch("/api/crm/contacts", { method: isCreate ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setTrayError(j.error || "Could not save contact"); return; }
    const fresh = await res.json();
    await load();
    if (isCreate && createAnother) { setDraft({ status: "New" }); setCreateMode(true); setEditMode(true); return; }
    setSelected(fresh); setDraft(fresh); setCreateMode(false); setEditMode(false);
  }

  async function deleteFromTray() {
    if (!selected?.id) return;
    await fetch(`/api/crm/contacts?id=${selected.id}`, { method: "DELETE" });
    closeTray();
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold inline-flex items-center gap-2"><Users size={20} /> Contacts</h1>
        <div className="flex items-center gap-2">
          <button className="crm-btn inline-flex items-center gap-1.5" onClick={openCreate}><Plus size={14} /> New contact record</button>
          <div className="inline-flex rounded-lg border border-neutral-700 p-1">
            <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")}><LayoutGrid size={16} /></button>
            <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")}><List size={16} /></button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <input placeholder="Search contacts..." value={query} onChange={(e) => setQuery(e.target.value)} className="crm-input md:col-span-2" />
        <select className="crm-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}><option value="createdAt">Sort: Created date</option><option value="status">Sort: Stage</option><option value="company">Sort: Company</option></select>
        <select className="crm-input" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}><option value="desc">Newest / Z-A</option><option value="asc">Oldest / A-Z</option></select>
      </div>

      {view === "bucket" ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {CONTACT_STAGES.map((stage, i) => (
              <div key={stage} className="crm-card p-3 w-[320px] shrink-0" onDragOver={(e) => e.preventDefault()} onDrop={async () => { if (!draggingContactId) return; await moveContactStage(draggingContactId, stage); setDraggingContactId(null); }}>
                <h3 className="mb-3 font-semibold text-emerald-300">{stageLabel(stage, i)}</h3>
                <div className="space-y-2 min-h-10">
                  {sorted.filter((c) => (c.status || "New") === stage).map((c) => (
                    <button key={c.id} draggable onDragStart={() => setDraggingContactId(c.id)} onDragEnd={() => setDraggingContactId(null)} className="crm-card w-full p-3 text-left cursor-grab" onClick={() => openTray(c)}>
                      <p className="font-semibold">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-400">{c.email || "No email"}</p>
                      <p className="text-xs text-slate-500">{c.company || "No company"}</p>
                      <p className="text-xs text-slate-500">Type: {c.type || "—"}</p>
                      <p className="mt-1 text-[11px] text-emerald-300">Gmail: {c.email ? gmail.filter((m) => `${m.from || ""} ${m.to || ""}`.toLowerCase().includes(String(c.email).toLowerCase())).length : 0}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="crm-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Company</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Stage</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
            <tbody>
              {sorted.map((c) => {
                const editing = editingId === c.id;
                return (
                  <tr key={c.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
                    <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(c)}>{editing ? <div className="grid grid-cols-2 gap-1"><input className="crm-input" value={inlineDraft.firstName || ""} onChange={(e)=>setInlineDraft({...inlineDraft, firstName:e.target.value})} /><input className="crm-input" value={inlineDraft.lastName || ""} onChange={(e)=>setInlineDraft({...inlineDraft, lastName:e.target.value})} /></div> : `${c.firstName} ${c.lastName}`}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.email || ""} onChange={(e)=>setInlineDraft({...inlineDraft, email:e.target.value})} /> : (c.email || "—")}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.company || ""} onChange={(e)=>setInlineDraft({...inlineDraft, company:e.target.value})} /> : (c.company || "—")}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <select className="crm-input" value={inlineDraft.type || ""} onChange={(e)=>setInlineDraft({...inlineDraft, type:e.target.value})}><option value="">Select type</option>{CONTACT_TYPES.map((t)=> <option key={t} value={t}>{t}</option>)}</select> : (c.type || "—")}</td>
                    <td className="px-3 py-2 text-emerald-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <select className="crm-input" value={inlineDraft.status || "New"} onChange={(e)=>setInlineDraft({...inlineDraft, status:e.target.value})}>{CONTACT_STAGES.map((s)=> <option key={s} value={s}>{s}</option>)}</select> : (c.status || "New")}</td>
                    <td className="px-3 py-2 text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2">{editing ? <div className="flex gap-2"><button className="crm-btn-ghost" onClick={saveInlineEdit}>Save</button><button className="crm-btn-ghost" onClick={cancelInlineEdit}>Cancel</button></div> : <button className="crm-btn-ghost" onClick={() => openTray(c)}>Open</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-40"><div className="absolute inset-0 bg-black/55" onClick={closeTray} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{createMode ? "New contact" : `${selected?.firstName || ""} ${selected?.lastName || ""}`}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex gap-2">
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" onClick={() => setEditMode(true)}><Pencil size={14} /> Edit</button> : <><button className="crm-btn inline-flex items-center gap-1.5" onClick={() => saveContact(false)}><Save size={14} /> Save</button>{createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => saveContact(true)}><Plus size={14} /> Create and add another</button>}{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}><CornerUpLeft size={14} /> Cancel</button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" onClick={deleteFromTray}><Trash2 size={14} /> Delete</button>}
            </div>
            <div className="mt-5 space-y-3 overflow-auto pb-10">
              {contactFields.map(([k, label, type]) => (
                <div key={k}>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{label}</label>
                  {(editMode || createMode) ? (
                    k === "type" ? (
                      <select className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}>
                        <option value="">Select type</option>
                        {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <input type={type === "select" ? "text" : type} className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                    )
                  ) : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft[k] || "—"}</p>}
                </div>
              ))}
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Lead stage</label>{(editMode || createMode) ? <select className="crm-input" value={draft.status || "New"} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>{CONTACT_STAGES.map((s, i) => <option key={s} value={s}>{stageLabel(s, i)}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.status || "New"}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Notes</label>{(editMode || createMode) ? <textarea className="crm-input min-h-28" value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{draft.notes || "—"}</p>}</div>
              {trayError && <p className="text-sm text-red-300">{trayError}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
