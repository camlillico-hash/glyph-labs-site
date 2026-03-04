"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Plus, Save, Check, CornerUpLeft, Trash2, LayoutGrid, List, X, Pencil } from "lucide-react";

type SortBy = "createdAt" | "contact" | "dueDate";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<"bucket" | "table">("table");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  const load = async () => {
    setTasks(await (await fetch('/api/crm/tasks', { cache: 'no-store' })).json());
    const contactsRes = await (await fetch('/api/crm/contacts', { cache: 'no-store' })).json();
    setContacts(Array.isArray(contactsRes) ? contactsRes : contactsRes.contacts || []);
  };
  useEffect(() => { load(); }, []);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : 'Unknown contact';
  };

  const sorted = useMemo(() => {
    const arr = [...tasks];
    arr.sort((a, b) => {
      let va: any = "", vb: any = "";
      if (sortBy === "createdAt") { va = new Date(a.createdAt || 0).getTime(); vb = new Date(b.createdAt || 0).getTime(); }
      else if (sortBy === "contact") { va = contactName(a.relatedId).toLowerCase(); vb = contactName(b.relatedId).toLowerCase(); }
      else { va = a.dueDate || ""; vb = b.dueDate || ""; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [tasks, sortBy, sortDir, contacts]);

  function openCreate() { setCreateMode(true); setEditMode(true); setSelected(null); setDraft({ relatedType: "contact", done: false }); setError(""); }
  function openTask(t: any) { setSelected(t); setDraft({ ...t }); setCreateMode(false); setEditMode(false); setError(""); }
  function closeTray() { setSelected(null); setDraft(null); setCreateMode(false); setEditMode(false); setError(""); }

  async function saveTask() {
    if (!draft) return;
    setError("");
    const res = await fetch('/api/crm/tasks', { method: createMode ? 'POST' : 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, relatedType: 'contact' }) });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not save task'); return; }
    const fresh = await res.json();
    await load();
    setSelected(fresh); setDraft(fresh); setCreateMode(false); setEditMode(false);
  }

  async function deleteTask(id: string) { await fetch(`/api/crm/tasks?id=${id}`, { method: 'DELETE' }); await load(); if (selected?.id === id) closeTray(); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold inline-flex items-center gap-2"><CheckSquare size={20} /> Tasks & Reminders</h1>
        <div className="flex items-center gap-2">
          <button className="crm-btn inline-flex items-center gap-1.5" onClick={openCreate}><Plus size={14} /> New task record</button>
          <div className="inline-flex rounded-lg border border-neutral-700 p-1">
            <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")}><LayoutGrid size={16} /></button>
            <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")}><List size={16} /></button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <select className="crm-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}><option value="createdAt">Sort: Created date</option><option value="contact">Sort: Contact</option><option value="dueDate">Sort: Due date</option></select>
        <select className="crm-input" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}><option value="desc">Newest / Z-A</option><option value="asc">Oldest / A-Z</option></select>
      </div>

      {view === "bucket" ? (
        <div className="space-y-2">
          {sorted.map((t) => (
            <div key={t.id} className="flex items-center justify-between crm-card p-3 cursor-pointer" onClick={() => openTask(t)}>
              <div>
                <p className={t.done ? 'line-through text-slate-500' : ''}>{t.title}</p>
                <p className="text-xs text-emerald-300">Contact: {contactName(t.relatedId)}</p>
                <p className="text-xs text-slate-400">Due: {t.dueDate || '—'} {t.notes ? `· ${t.notes}` : ''}</p>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button className="crm-btn-ghost text-xs" onClick={async () => { await fetch('/api/crm/tasks', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...t, done: !t.done, relatedType: 'contact' }) }); load(); }}>{t.done ? <span className='inline-flex items-center gap-1'><CornerUpLeft size={13} /> Undo</span> : <span className='inline-flex items-center gap-1'><Check size={13} /> Done</span>}</button>
                <button className="text-xs text-red-300 inline-flex items-center gap-1" onClick={async () => deleteTask(t.id)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="crm-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left">Task</th><th className="px-3 py-2 text-left">Contact</th><th className="px-3 py-2 text-left">Due</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className="border-b border-neutral-900 hover:bg-neutral-900/60 cursor-pointer" onClick={() => openTask(t)}>
                  <td className="px-3 py-2">{t.title}</td><td className="px-3 py-2 text-slate-300">{contactName(t.relatedId)}</td><td className="px-3 py-2 text-slate-300">{t.dueDate || "—"}</td><td className="px-3 py-2 text-slate-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td><td className="px-3 py-2">{t.done ? <span className="text-emerald-300">Done</span> : <span className="text-amber-300">Open</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={closeTray} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{createMode ? "New task" : draft.title || "Task"}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex gap-2">
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" onClick={() => setEditMode(true)}><Pencil size={14} /> Edit</button> : <><button className="crm-btn inline-flex items-center gap-1.5" onClick={saveTask}><Save size={14} /> Save</button>{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => { setDraft({ ...selected }); setEditMode(false); setError(""); }}><CornerUpLeft size={14} /> Cancel</button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" onClick={() => deleteTask(selected.id)}><Trash2 size={14} /> Delete</button>}
            </div>
            <div className="mt-5 space-y-3">
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Task title</label>{(editMode || createMode) ? <input className="crm-input" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.title || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Linked contact</label>{(editMode || createMode) ? <select className="crm-input" value={draft.relatedId || ''} onChange={(e) => setDraft({ ...draft, relatedId: e.target.value, relatedType: 'contact' })}><option value="">Select linked contact *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{contactName(draft.relatedId)}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Due date</label>{(editMode || createMode) ? <input type="date" className="crm-input" value={draft.dueDate || ''} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.dueDate || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Notes</label>{(editMode || createMode) ? <textarea className="crm-input min-h-28" value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{draft.notes || '—'}</p>}</div>
              {!createMode && <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Done</label><button className="crm-btn-ghost" onClick={async () => { await fetch('/api/crm/tasks', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, done: !draft.done, relatedType: 'contact' }) }); await load(); setDraft({ ...draft, done: !draft.done }); }}>{draft.done ? 'Mark as open' : 'Mark as done'}</button></div>}
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
