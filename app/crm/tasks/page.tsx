"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Plus, Save, Trash2, LayoutGrid, List, X, Pencil, Circle, CircleCheck, Mail, Phone, MessageSquare, Linkedin, Users, CalendarCheck2, CheckCheck, SquareArrowOutUpRight, Activity, ChevronDown, ChevronRight } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

const TASK_STATUSES = ["Overdue", "Not started", "Completed", "Canceled"];
const TASK_TYPES = ["email", "call", "text", "linkedin", "in_person", "meeting", "to_do", "task_completed"];
const ACTIVITY_TYPES = [
  { value: "email", label: "Email" },
  { value: "call", label: "Call" },
  { value: "text", label: "Text" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "in_person", label: "In person" },
  { value: "meeting", label: "Meeting" },
  { value: "task_completed", label: "Task completed" },
];

const prettyType = (v?: string) => String(v || "").split("_").map((s) => s ? s[0].toUpperCase() + s.slice(1) : s).join(" ");
const typeIcon = (v?: string) => {
  const t = String(v || "");
  if (t === "email") return Mail;
  if (t === "call") return Phone;
  if (t === "text") return MessageSquare;
  if (t === "linkedin") return Linkedin;
  if (t === "in_person") return Users;
  if (t === "meeting") return CalendarCheck2;
  if (t === "to_do") return CheckSquare;
  if (t === "task_completed") return CheckCheck;
  return CalendarCheck2;
};
const openPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
  el.showPicker?.();
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<"bucket" | "table">("table");
  const [tasksOpen, setTasksOpen] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [activityCreateOpen, setActivityCreateOpen] = useState(false);
  const [activityDraft, setActivityDraft] = useState<any>({ type: "email", occurredAtLocal: "" });
  const [activityError, setActivityError] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [hoverTaskStatus, setHoverTaskStatus] = useState<string | null>(null);
  const [hoverDrop, setHoverDrop] = useState<{ status: string; index: number } | null>(null);
  const [fadingIds, setFadingIds] = useState<string[]>([]);
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; action: (() => void) | null }>({ open: false, message: "", action: null });
  const [movePicker, setMovePicker] = useState<{ open: boolean; taskId?: string }>({ open: false });

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
    const activitiesRes = await (await fetch('/api/crm/activities', { cache: 'no-store' })).json();
    setContacts(Array.isArray(contactsRes) ? contactsRes : contactsRes.contacts || []);
    setDeals(Array.isArray(dealsRes) ? dealsRes : dealsRes.deals || []);
    setActivities(Array.isArray(activitiesRes) ? activitiesRes : []);
  };
  useEffect(() => { load(); }, []);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : 'Unknown person';
  };
  const dealName = (id?: string) => {
    const d = deals.find((x) => x.id === id);
    return d ? (d.name || 'Untitled deal') : 'Unknown deal';
  };
  const contactPipelineLabel = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c?.pipelineType === 'connector' ? 'Connector' : 'Lead';
  };
  const relatedLabel = (task: any) => task.relatedType === 'deal' ? `Deal: ${dealName(task.relatedId)}` : `Person: ${contactName(task.relatedId)}`;

  const getTaskStatus = (t: any) => {
    const base = t.status || (t.done ? "Completed" : "Not started");
    if (base === "Completed" || base === "Canceled") return base;
    if (t.dueDate) {
      const due = new Date(`${t.dueDate}T23:59:59`).getTime();
      if (!Number.isNaN(due) && due < Date.now()) return "Overdue";
    }
    return "Not started";
  };

  const sorted = useMemo(() => [...tasks], [tasks]);
  const completedTasks = useMemo(() => {
    return [...activities]
      .filter((a) => String(a.note || "").startsWith("Task completed:"))
      .sort((a, b) => new Date(b.occurredAt || b.createdAt).getTime() - new Date(a.occurredAt || a.createdAt).getTime())
      .slice(0, 30)
      .map((a) => {
        const raw = String(a.note || "").replace(/^Task completed:\s*/, "");
        const title = raw.split(" — ")[0] || raw;
        return { ...a, completedTitle: title };
      });
  }, [activities]);

  const activityItems = useMemo(() => {
    return [...activities].sort((a, b) => new Date(b.occurredAt || b.createdAt).getTime() - new Date(a.occurredAt || a.createdAt).getTime());
  }, [activities]);

  function openCreate() { setCreateMode(true); setEditMode(true); setSelected(null); setDraft({ relatedType: "contact", type: "meeting", status: "Not started" }); setError(""); }
  function openTask(t: any) { setSelected(t); setDraft({ ...t, type: t.type || "meeting", status: t.status || (t.done ? "Completed" : "Not started") }); setCreateMode(false); setEditMode(false); setError(""); }
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

  async function moveTaskStatus(taskId: string, status: string, targetIndex?: number) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || getTaskStatus(task) === status) return;
    if (status === "Overdue") return;
    if (status === "Completed") return completeTask(task);
    setTasks((prev) => {
      const moving = prev.find((t) => t.id === taskId);
      if (!moving) return prev;
      const others = prev.filter((t) => t.id !== taskId);
      const updated = { ...moving, status };
      if (targetIndex === undefined) return [...others, updated];

      const next: any[] = [];
      let statusCount = 0;
      let inserted = false;
      for (const t of others) {
        const s = getTaskStatus(t);
        if (s === status && statusCount === targetIndex) {
          next.push(updated);
          inserted = true;
        }
        next.push(t);
        if (s === status) statusCount++;
      }
      if (!inserted) next.push(updated);
      return next;
    });
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
  async function deleteActivity(id: string) {
    const res = await fetch(`/api/crm/activities?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      setActivityError('Could not delete activity');
      return;
    }
    await load();
  }

  async function saveActivity() {
    setActivityError('');
    const res = await fetch('/api/crm/activities', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...activityDraft,
        occurredAt: activityDraft.occurredAtLocal ? new Date(activityDraft.occurredAtLocal).toISOString() : undefined,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setActivityError(j.error || 'Could not save activity');
      return;
    }
    setActivityCreateOpen(false);
    setActivityDraft({ type: 'email', occurredAtLocal: '' });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-violet-200 whitespace-nowrap"><CheckSquare size={20} /> Work Hub</h1>
          <p className="mt-1 text-sm text-slate-400">Tasks first, activities beneath, both tied directly to people in your CRM.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 font-semibold text-white hover:bg-violet-600" onClick={openCreate}><Plus size={14} /> New task</button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 font-semibold text-slate-200 hover:border-neutral-500" onClick={() => { setActivityCreateOpen(true); setActivityDraft({ type: 'email', occurredAtLocal: '' }); setActivityError(''); }}><Activity size={14} /> New activity</button>
          <div className="inline-flex rounded-lg border border-neutral-700 p-1">
            <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")}><LayoutGrid size={16} /></button>
            <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")}><List size={16} /></button>
          </div>
        </div>
      </div>

      <section className="crm-card p-4">
        <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setTasksOpen((v) => !v)}>
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold text-violet-200">{tasksOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />} Tasks ({tasks.length})</h2>
            <p className="mt-1 text-sm text-slate-400">Manage next steps for connector people, lead people, and deals.</p>
          </div>
        </button>
      </section>

      {tasksOpen && (
        <>
          {view === "bucket" ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                {TASK_STATUSES.map((status) => (
                  <div key={status} className={`crm-card p-3 w-[240px] shrink-0 transition-all duration-150 ${hoverTaskStatus === status ? "ring-2 ring-emerald-500/80 border-emerald-500/70" : ""}`} onDragOver={(e)=>e.preventDefault()} onDragEnter={() => setHoverTaskStatus(status)} onDragLeave={() => setHoverTaskStatus((s) => s === status ? null : s)} onDrop={async ()=>{ if(!draggingTaskId) return; await moveTaskStatus(draggingTaskId, status); setDraggingTaskId(null); setHoverTaskStatus(null); setHoverDrop(null); }}>
                    <h3 className="mb-3 font-semibold text-emerald-300">{status}</h3>
                    <div className="min-h-10">
                      {(() => {
                        const stageTasks = sorted.filter((t) => getTaskStatus(t) === status);
                        return (
                          <>
                            {stageTasks.map((t, idx) => (
                              <div key={t.id}>
                                <div
                                  className={`my-1 h-1 rounded-full transition-all ${hoverDrop?.status === status && hoverDrop.index === idx ? "bg-emerald-400" : "bg-transparent"}`}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDragEnter={() => setHoverDrop({ status, index: idx })}
                                  onDrop={async () => { if (!draggingTaskId) return; await moveTaskStatus(draggingTaskId, status, idx); setDraggingTaskId(null); setHoverTaskStatus(null); setHoverDrop(null); }}
                                />
                                <button draggable onDragStart={() => setDraggingTaskId(t.id)} onDragEnd={() => { setDraggingTaskId(null); setHoverTaskStatus(null); setHoverDrop(null); }} className={`crm-card w-full min-w-0 p-3 text-left cursor-grab transition-all duration-150 ${draggingTaskId === t.id ? 'scale-[1.02] opacity-70' : ''} ${fadingIds.includes(t.id) ? 'opacity-0' : 'opacity-100'}`} onClick={() => openTask(t)}>
                                  <p className="truncate font-medium">{t.title}</p>
                                  <p className="truncate text-xs text-violet-300 inline-flex items-center gap-1.5">{(() => { const I = typeIcon(t.type || 'meeting'); return <I size={12} />; })()} Type: {prettyType(t.type || 'meeting')}</p>
                                  <p className="truncate text-xs text-emerald-300">{t.relatedType === 'contact' && t.relatedId ? <span>{contactPipelineLabel(t.relatedId)} person: <a className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} href={`/crm/${(contacts.find((c) => c.id === t.relatedId)?.pipelineType || 'connector') === 'connector' ? 'connectors' : 'leads'}?contactId=${t.relatedId}`}>{contactName(t.relatedId)}</a></span> : relatedLabel(t)}</p>
                                  <p className="truncate text-xs text-slate-400">Due: {t.dueDate || '—'}</p>
                                  <button type="button" className="mt-2 inline-flex md:hidden rounded border border-neutral-700 px-2 py-1 text-[11px] text-slate-300" onClick={(e) => { e.stopPropagation(); setMovePicker({ open: true, taskId: t.id }); }}>
                                    Move
                                  </button>
                                </button>
                              </div>
                            ))}
                            <div
                              className={`mt-1 h-1 rounded-full transition-all ${hoverDrop?.status === status && hoverDrop.index === stageTasks.length ? "bg-emerald-400" : "bg-transparent"}`}
                              onDragOver={(e) => e.preventDefault()}
                              onDragEnter={() => setHoverDrop({ status, index: stageTasks.length })}
                              onDrop={async () => { if (!draggingTaskId) return; await moveTaskStatus(draggingTaskId, status, stageTasks.length); setDraggingTaskId(null); setHoverTaskStatus(null); setHoverDrop(null); }}
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
                <thead className="border-b border-neutral-800 text-slate-400"><tr><th className="px-3 py-2 text-left"></th><th className="px-3 py-2 text-left">Task</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Person / deal</th><th className="px-3 py-2 text-left">Pipeline</th><th className="px-3 py-2 text-left">Due</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
                <tbody>
                  {sorted.map((t) => {
                    const editing = editingId === t.id;
                    const status = getTaskStatus(t);
                    return (
                      <tr key={t.id} className={`border-b border-neutral-900 hover:bg-neutral-900/60 transition-opacity ${fadingIds.includes(t.id) ? 'opacity-0' : 'opacity-100'}`}>
                        <td className="px-3 py-2">
                          <button onClick={() => completeTask(t)} className="text-slate-400 hover:text-emerald-300" title="Complete task">
                            {fadingIds.includes(t.id) || status === 'Completed' ? <CircleCheck size={18} className="text-emerald-400" /> : <Circle size={18} />}
                          </button>
                        </td>
                        <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(t)}>{editing ? <input className="crm-input" value={inlineDraft.title || ''} onChange={(e)=>setInlineDraft({...inlineDraft, title:e.target.value})} /> : t.title}</td>
                        <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(t)}>{editing ? <select className="crm-input" value={inlineDraft.type || 'meeting'} onChange={(e)=>setInlineDraft({...inlineDraft, type:e.target.value})}>{TASK_TYPES.map((s)=> <option key={s} value={s}>{prettyType(s)}</option>)}</select> : <span className="inline-flex items-center gap-1.5">{(() => { const I = typeIcon(t.type || 'meeting'); return <I size={13} />; })()}{prettyType(t.type || 'meeting')}</span>}</td>
                        <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(t)}>{editing ? <select className="crm-input" value={inlineDraft.relatedId || ''} onChange={(e)=>setInlineDraft({...inlineDraft, relatedId:e.target.value})}>{inlineDraft.relatedType === 'deal' ? <><option value="">Select linked deal *</option>{deals.map((d)=> <option key={d.id} value={d.id}>{d.name || 'Untitled deal'}</option>)}</> : <><option value="">Select linked person *</option>{contacts.map((c)=> <option key={c.id} value={c.id}>[{c.pipelineType === 'connector' ? 'Connector' : 'Lead'}] {c.firstName} {c.lastName}</option>)}</>}</select> : (t.relatedType === 'contact' ? <span>{t.relatedId ? <a className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} href={`/crm/${(contacts.find((c) => c.id === t.relatedId)?.pipelineType || 'connector') === 'connector' ? 'connectors' : 'leads'}?contactId=${t.relatedId}`}>{contactName(t.relatedId)}</a> : 'Unknown person'}</span> : relatedLabel(t))}</td>
                        <td className="px-3 py-2 text-slate-300">{t.relatedType === 'contact' && t.relatedId ? contactPipelineLabel(t.relatedId) : 'Deal'}</td>
                        <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(t)}>{editing ? <input type="date" className="crm-input" value={inlineDraft.dueDate || ''} onClick={openPicker} onFocus={openPicker} onChange={(e)=>setInlineDraft({...inlineDraft, dueDate:e.target.value})} /> : (t.dueDate || '—')}</td>
                        <td className="px-3 py-2 text-slate-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(t)}>{editing ? <select className="crm-input" value={inlineDraft.status || 'Not started'} onChange={(e)=>setInlineDraft({...inlineDraft, status:e.target.value})}>{TASK_STATUSES.map((s)=> <option key={s} value={s} disabled={s === 'Overdue'}>{s}</option>)}</select> : <span className={status === 'Completed' ? 'text-emerald-300' : status === 'Canceled' ? 'text-rose-300' : status === 'Overdue' ? 'text-rose-300' : 'text-amber-300'}>{status}</span>}</td>
                        <td className="px-3 py-2">{editing ? <div className="flex gap-2"><button className="crm-btn-ghost" title="Save" aria-label="Save" onClick={saveInlineEdit}><Save size={14} className="text-emerald-300" /></button><button className="crm-btn-ghost" title="Cancel" aria-label="Cancel" onClick={cancelInlineEdit}><X size={14} className="text-rose-300" /></button></div> : <button className="crm-btn-ghost" title="Open tray" aria-label="Open tray" onClick={() => openTask(t)}><SquareArrowOutUpRight size={14} /></button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <section className="crm-card p-4">
            <h2 className="mb-3 text-base font-semibold text-emerald-300">Completed Tasks ({completedTasks.length})</h2>
            {completedTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No completed tasks yet.</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-neutral-800 text-slate-400">
                    <tr>
                      <th className="px-2 py-2 text-left">Task</th>
                      <th className="px-2 py-2 text-left">Contact</th>
                      <th className="px-2 py-2 text-left">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTasks.map((a) => (
                      <tr key={a.id} className="border-b border-neutral-900">
                        <td className="px-2 py-2 text-slate-200">{a.completedTitle}</td>
                        <td className="px-2 py-2 text-slate-300">{a.contactId ? <a className="text-sky-300 hover:text-sky-200" href={`/crm/${(contacts.find((c) => c.id === a.contactId)?.pipelineType || 'connector') === 'connector' ? 'connectors' : 'leads'}?contactId=${a.contactId}`}>{contactName(a.contactId)}</a> : 'Unknown person'}</td>
                        <td className="px-2 py-2 text-slate-400">{new Date(a.occurredAt || a.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <section className="crm-card p-4">
        <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setActivitiesOpen((v) => !v)}>
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold text-sky-200">{activitiesOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />} Activities ({activityItems.length})</h2>
            <p className="mt-1 text-sm text-slate-400">Every outreach log stays tied to a real CRM contact.</p>
          </div>
        </button>
      </section>

      {activitiesOpen && (
        <div className="crm-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Person</th>
                <th className="px-3 py-2 text-left">Pipeline</th>
                <th className="px-3 py-2 text-left">When</th>
                <th className="px-3 py-2 text-left">Note</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activityItems.map((a) => (
                <tr key={a.id} className="border-b border-neutral-900">
                  <td className="px-3 py-2"><span className="inline-flex items-center gap-1.5">{(() => { const I = typeIcon(a.type); return <I size={13} />; })()}{ACTIVITY_TYPES.find((t) => t.value === a.type)?.label || a.type}</span></td>
                  <td className="px-3 py-2 text-slate-300">{a.contactId ? <a className="text-sky-300 hover:text-sky-200" href={`/crm/${(contacts.find((c) => c.id === a.contactId)?.pipelineType || 'connector') === 'connector' ? 'connectors' : 'leads'}?contactId=${a.contactId}`}>{contactName(a.contactId)}</a> : '—'}</td>
                  <td className="px-3 py-2 text-slate-300">{a.contactId ? contactPipelineLabel(a.contactId) : '—'}</td>
                  <td className="px-3 py-2 text-slate-300">{new Date(a.occurredAt || a.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-slate-300">{a.note || '—'}</td>
                  <td className="px-3 py-2"><button className="text-xs text-red-300 inline-flex items-center gap-1" onClick={() => setConfirmState({ open: true, message: 'Are you sure you want to delete this record?', action: () => deleteActivity(a.id) })}><Trash2 size={13} /> Delete</button></td>
                </tr>
              ))}
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
              {!createMode && !editMode ? <button className="crm-btn inline-flex items-center gap-1.5" title="Open" aria-label="Open" onClick={() => setEditMode(true)}><Pencil size={14} /></button> : <><button className="crm-btn inline-flex items-center gap-1.5" title="Save" aria-label="Save" onClick={saveTask}><Save size={14} className="text-emerald-300" /></button>{!createMode && <button className="crm-btn-ghost inline-flex items-center gap-1.5" title="Cancel" aria-label="Cancel" onClick={() => { setDraft({ ...selected }); setEditMode(false); setError(""); }}><X size={14} className="text-rose-300" /></button>}</>}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" title="Delete" aria-label="Delete" onClick={() => setConfirmState({ open: true, message: "Are you sure you want to delete this record?", action: () => deleteTask(selected.id) })}><Trash2 size={14} /></button>}
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Task title</label>{(editMode || createMode) ? <input className="crm-input" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.title || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Type</label>{(editMode || createMode) ? <select className="crm-input" value={draft.type || 'meeting'} onChange={(e)=>setDraft({...draft, type:e.target.value})}>{TASK_TYPES.map((s)=> <option key={s} value={s}>{prettyType(s)}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{prettyType(draft.type || 'meeting')}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Related type</label>{(editMode || createMode) ? <select className="crm-input" value={draft.relatedType || 'contact'} onChange={(e) => setDraft({ ...draft, relatedType: e.target.value, relatedId: '' })}><option value="contact">Person</option><option value="deal">Deal</option></select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.relatedType || 'contact'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Linked record</label>{(editMode || createMode) ? <select className="crm-input" value={draft.relatedId || ''} onChange={(e) => setDraft({ ...draft, relatedId: e.target.value })}>{(draft.relatedType || 'contact') === 'deal' ? <><option value="">Select linked deal *</option>{deals.map((d) => <option key={d.id} value={d.id}>{d.name || 'Untitled deal'}</option>)}</> : <><option value="">Select linked person *</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</>}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{(draft.relatedType || 'contact') === 'deal' ? dealName(draft.relatedId) : (draft.relatedId ? <a className="text-sky-300 hover:text-sky-200" href={`/crm/contacts?contactId=${draft.relatedId}`}>{contactName(draft.relatedId)}</a> : 'Unknown person')}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Task status</label>{(editMode || createMode) ? <select className="crm-input" value={draft.status || 'Not started'} onChange={(e)=>setDraft({...draft, status:e.target.value})}>{TASK_STATUSES.map((s)=> <option key={s} value={s} disabled={s === 'Overdue'}>{s}</option>)}</select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.status || 'Not started'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Due date</label>{(editMode || createMode) ? <input type="date" className="crm-input" value={draft.dueDate || ''} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.dueDate || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Notes</label>{(editMode || createMode) ? <textarea className="crm-input min-h-28" value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{draft.notes || '—'}</p>}</div>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>
          </aside>
        </div>
      )}

      {activityCreateOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setActivityCreateOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">New activity</h2>
              <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => setActivityCreateOpen(false)}><X size={14} /> Close</button>
            </div>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Activity type</label>
                <select className="crm-input" value={activityDraft.type || 'email'} onChange={(e) => setActivityDraft({ ...activityDraft, type: e.target.value })}>
                  {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Person</label>
                <select className="crm-input" value={activityDraft.contactId || ''} onChange={(e) => setActivityDraft({ ...activityDraft, contactId: e.target.value })}>
                  <option value="">Select person *</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>[{c.pipelineType === 'connector' ? 'Connector' : 'Lead'}] {c.firstName} {c.lastName} {c.email ? `(${c.email})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Occurred at</label>
                <input type="datetime-local" className="crm-input" value={activityDraft.occurredAtLocal || ''} onClick={openPicker} onFocus={openPicker} onChange={(e) => setActivityDraft({ ...activityDraft, occurredAtLocal: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Note</label>
                <textarea className="crm-input min-h-28" value={activityDraft.note || ''} onChange={(e) => setActivityDraft({ ...activityDraft, note: e.target.value })} />
              </div>
              {activityError && <p className="text-sm text-red-300">{activityError}</p>}
              <button className="crm-btn inline-flex items-center gap-1.5" onClick={saveActivity}><Save size={14} /> Save activity</button>
            </div>
          </aside>
        </div>
      )}

      {movePicker.open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMovePicker({ open: false })} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Move task to status</h3>
            <div className="mt-3 grid gap-2">
              {TASK_STATUSES.filter((s) => s !== "Overdue").map((s) => (
                <button key={s} className="crm-btn-ghost text-left" onClick={async () => { if (!movePicker.taskId) return; await moveTaskStatus(movePicker.taskId, s); setMovePicker({ open: false }); }}>
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
