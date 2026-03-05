"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Plus, Save, CornerUpLeft, Trash2, LayoutGrid, List, X, Pencil, Circle, CircleCheck } from "lucide-react";

const TASK_STATUSES = ["Not started", "Completed", "Canceled"];
const openPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
  el.showPicker?.();
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<"bucket" | "table">("table");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [fadingIds, setFadingIds] = useState<string[]>([]);

  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState<any>(null);

  const load = async () => {
    const tasksRes = await (await fetch('/api/crm/tasks', { cache: 'no-store' })).json();
    setTasks(Array.isArray(tasksRes) ? tasksRes : tasksRes.tasks || []);
    const contactsRes = await (await fetch('/api/crm/contacts', { cache: 'no-store' })).json();
    const dealsRes = await (await fetch('/api/crm/deals', { cache: 'no-store' })).json();
    setContacts(Array.isArray(contactsRes) ? contactsRes : contactsRes.contacts || []);
    setDeals(Array.isArray(dealsRes) ? dealsRes : dealsRes.deals || []);
  };
  useEffect(() => { load(); }, []);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : 'Unknown contact';
  };
  const dealName = (id?: string) => {
    const d = deals.find((x) => x.id === id);
    return d ? (d.name || 'Untitled deal') : 'Unknown deal';
  };
  const relatedLabel = (task: any) => task.relatedType === 'deal' ? `Deal: ${dealName(task.relatedId)}` : `Contact: ${contactName(task.relatedId)}`;

  const sorted = useMemo(() => [...tasks], [tasks]);

  function openCreate() { setCreateMode(true); setEditMode(true); setSelected(null); setDraft({ relatedType: "contact", status: "Not started" }); setError(""); }
  function openTask(t: any) { setSelected(t); setDraft({ ...t, status: t.status || (t.done ? "Completed" : "Not started") }); setCreateMode(false); setEditMode(false); setError(""); }
  function closeTray() { setSelected(null); setDraft(null); setCreateMode(false); setEditMode(false); setError(""); }

  function startInlineEdit(t: any) { setEditingId(t.id); setInlineDraft({ ...t, status: t.status || (t.done ? "Completed" : "Not started") }); }
  function cancelInlineEdit() { setEditingId(null); setInlineDraft(null); }
  async function saveInlineEdit() {
    if (!inlineDraft) return;
    const res = await fetch('/api/crm/tasks', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(inlineDraft) });
    if (!res.ok) return;
    await load();
    cancelInlineEdit();
  }

  async function completeTask(task: any) {
    setFadingIds((ids) => [...ids, task.id]);
    await fetch('/api/crm/tasks', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...task, status: 'Completed' }),
    });
    setTimeout(async () => {
      setFadingIds((ids) => ids.filter((x) => x !== task.id));
      await load();
      if (selected?.id === task.id) closeTray();
    }, 220);
  }

  async function moveTaskStatus(taskId: string, status: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || (task.status || "Not started") === status) return;
    if (status === "Completed") return completeTask(task);
    await fetch('/api/crm/tasks', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...task, status }),
    });
    await load();
  }

  async function saveTask() {
    if (!draft) return;
    setError("");
    const res = await fetch('/api/crm/tasks', { method: createMode ? 'POST' : 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(draft) });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not save task'); return; }
    await load();
    closeTray();
  }

  async function deleteTask(id: string) { await fetch(`/api/crm/tasks?id=${id}`, { method: 'DELETE' }); await load(); if (selected?.id === id) closeTray(); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-violet-200 whitespace-nowrap"><CheckSquare size={20} /> Tasks ({tasks.length})</h1>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 font-semibold text-white hover:bg-violet-600" onClick={openCreate}><Plus size={14} /> New</button>
          <div className="inline-flex rounded-lg border border-neutral-700 p-1">
            <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")}><LayoutGrid size={16} /></button>
            <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")}><List size={16} /></button>
          </div>
        </div>
      </div>

      {view === "bucket" ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {TASK_STATUSES.map((status) => (
              <div key={status} className="crm-card p-3 w-[320px] shrink-0" onDragOver={(e)=>e.preventDefault()} onDrop={async ()=>{ if(!draggingTaskId) return; await moveTaskStatus(draggingTaskId, status); setDraggingTaskId(null); }}>
                <h3 className="mb-3 font-semibold text-emerald-300">{status}</h3>
                <div className="space-y-2 min-h-10">
                  {sorted.filter((t) => (t.status || (t.done ? "Completed" : "Not started")) === status).map((t) => (
                    <button key={t.id} draggable onDragStart={() => setDraggingTaskId(t.id)} onDragEnd={() => setDraggingTaskId(null)} className={`crm-card w-full p-3 text-left cursor-grab transition-opacity ${fadingIds.includes(t.id) ? 'opacity-0' : 'opacity-100'}`} onClick={() => openTask(t)}>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-emerald-300">{relatedLabel(t)}</p>
                      <p className="text-xs text-slate-400">Due: {t.dueDate || '—'}</p>
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
            <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left"></th><th className="px-3 py-2 text-left">Task</th><th className="px-3 py-2 text-left">Contact</th><th className="px-3 py-2 text-left">Due</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
            <tbody>
              {sorted.map((t) => {
                const editing = editingId === t.id;
                const status = t.status || (t.done ? 'Completed' : 'Not started');
                return (
                  <tr key={t.id} className={`border-b border-neutral-900 hover:bg-neutral-900/60 transition-opacity ${fadingIds.includes(t.id) ? 'opacity-0' : 'opacity-100'}`}>
                    <td className="px-3 py-2">
                      <button onClick={() => completeTask(t)} className="text-slate-400 hover:text-emerald-300" title="Complete task">
                        {fadingIds.includes(t.id) || status === 'Completed' ? <CircleCheck size={18} className="text-emerald-400" /> : <Circle size={18} />}
                      </button>
                    </td>
                    <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(t)}>{editing ? <input className="crm-input" value={inlineDraft.title || ''} onChange={(e)=>setInlineDraft({...inlineDraft, title:e.target.value})} /> : t.title}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(t)}>{editing ? <select className="crm-input" value={inlineDraft.relatedId || ''} onChange={(e)=>setInlineDraft({...inlineDraft, relatedId:e.target.value})}>{inlineDraft.relatedType === 'deal' ? <><option value="">Select linked deal *</option>{deals.map((d)=> <option key={d.id} value={d.id}>{d.name || 'Untitled deal'}</option>)}</> : <><option value="">Select linked contact *</option>{contacts.map((c)=> <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</>}</select> : relatedLabel(t)}</td>
                    <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(t)}>{editing ? <input type="date" className="crm-input" value={inlineDraft.dueDate || ''} onClick={openPicker} onFocus={openPicker} onChange={(e)=>setInlineDraft({...inlineDraft, dueDate:e.target.value})} /> : (t.dueDate || '—')}</td>
                    <td className="px-3 py-2 text-slate-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(t)}>{editing ? <select className="crm-input" value={inlineDraft.status || 'Not started'} onChange={(e)=>setInlineDraft({...inlineDraft, status:e.target.value})}>{TASK_STATUSES.map((s)=> <option key={s} value={s}>{s}</option>)}</select> : <span className={status === 'Completed' ? 'text-emerald-300' : status === 'Canceled' ? 'text-rose-300' : 'text-amber-300'}>{status}</span>}</td>
                    <td className="px-3 py-2">{editing ? <div className="flex gap-2"><button className="crm-btn-ghost" onClick={saveInlineEdit}>Save</button><button className="crm-btn-ghost" onClick={cancelInlineEdit}>Cancel</button></div> : <button className="crm-btn-ghost" onClick={() => openTask(t)}>Open</button>}</td>
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
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{createMode ? "New task" : draft.title || "Task"}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex gap-2">
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" onClick={() => setEditMode(true)}><Pencil size={14} /> Edit</button> : <><button className="crm-btn inline-flex items-center gap-1.5" onClick={saveTask}><Save size={14} /> Save</button>{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => { setDraft({ ...selected }); setEditMode(false); setError(""); }}><CornerUpLeft size={14} /> Cancel</button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" onClick={() => { if (!confirm("Are you sure you want to delete this record?")) return; deleteTask(selected.id); }}><Trash2 size={14} /> Delete</button>}
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Task title</label>{(editMode || createMode) ? <input className="crm-input" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.title || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Related type</label>{(editMode || createMode) ? <select className="crm-input" value={draft.relatedType || 'contact'} onChange={(e) => setDraft({ ...draft, relatedType: e.target.value, relatedId: '' })}><option value="contact">Contact</option><option value="deal">Deal</option></select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.relatedType || 'contact'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Linked record</label>{(editMode || createMode) ? <select className="crm-input" value={draft.relatedId || ''} onChange={(e) => setDraft({ ...draft, relatedId: e.target.value })}>{(draft.relatedType || 'contact') === 'deal' ? <><option value="">Select linked deal *</option>{deals.map((d) => <option key={d.id} value={d.id}>{d.name || 'Untitled deal'}</option>)}</> : <><option value="">Select linked contact *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</>}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{(draft.relatedType || 'contact') === 'deal' ? dealName(draft.relatedId) : contactName(draft.relatedId)}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Task status</label>{(editMode || createMode) ? <select className="crm-input" value={draft.status || 'Not started'} onChange={(e)=>setDraft({...draft, status:e.target.value})}>{TASK_STATUSES.map((s)=> <option key={s} value={s}>{s}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.status || 'Not started'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Due date</label>{(editMode || createMode) ? <input type="date" className="crm-input" value={draft.dueDate || ''} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.dueDate || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Notes</label>{(editMode || createMode) ? <textarea className="crm-input min-h-28" value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{draft.notes || '—'}</p>}</div>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
