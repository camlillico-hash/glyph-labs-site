"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Plus, Save, Check, CornerUpLeft, Trash2, LayoutGrid, List } from "lucide-react";

type SortBy = "createdAt" | "contact" | "dueDate";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ relatedType: "contact" });
  const [error, setError] = useState("");
  const [view, setView] = useState<"bucket" | "table">("bucket");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
      let va: any = "";
      let vb: any = "";
      if (sortBy === "createdAt") {
        va = new Date(a.createdAt || 0).getTime();
        vb = new Date(b.createdAt || 0).getTime();
      } else if (sortBy === "contact") {
        va = contactName(a.relatedId).toLowerCase();
        vb = contactName(b.relatedId).toLowerCase();
      } else {
        va = a.dueDate || "";
        vb = b.dueDate || "";
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [tasks, sortBy, sortDir, contacts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold inline-flex items-center gap-2"><CheckSquare size={20} /> Tasks & Reminders</h1>
        <div className="inline-flex rounded-lg border border-neutral-700 p-1">
          <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")} title="Card view"><LayoutGrid size={16} /></button>
          <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")} title="Table view"><List size={16} /></button>
        </div>
      </div>

      <div className="crm-card p-4">
        <h2 className="font-semibold inline-flex items-center gap-1.5"><Plus size={14} /> Add task</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <input placeholder="Task title" className="crm-input" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="crm-input" value={form.relatedId || ''} onChange={(e) => setForm({ ...form, relatedId: e.target.value, relatedType: 'contact' })}>
            <option value="">Select linked contact *</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ''}</option>)}
          </select>
          <input type="date" className="crm-input" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <input placeholder="Notes" className="crm-input" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        <button className="mt-2 crm-btn inline-flex items-center gap-1.5" onClick={async () => {
          setError('');
          const res = await fetch('/api/crm/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, done: false, relatedType: 'contact' }) });
          if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not save task'); return; }
          setForm({ relatedType: 'contact' });
          load();
        }}><Save size={14} /> Save task</button>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <select className="crm-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          <option value="createdAt">Sort: Created date</option>
          <option value="contact">Sort: Contact</option>
          <option value="dueDate">Sort: Due date</option>
        </select>
        <select className="crm-input" value={sortDir} onChange={(e) => setSortDir(e.target.value as "asc" | "desc") }>
          <option value="desc">Newest / Z-A</option>
          <option value="asc">Oldest / A-Z</option>
        </select>
      </div>

      {view === "bucket" ? (
        <div className="space-y-2">
          {sorted.map((t) => (
            <div key={t.id} className="flex items-center justify-between crm-card p-3">
              <div>
                <p className={t.done ? 'line-through text-slate-500' : ''}>{t.title}</p>
                <p className="text-xs text-emerald-300">Contact: {contactName(t.relatedId)}</p>
                <p className="text-xs text-slate-400">Due: {t.dueDate || '—'} {t.notes ? `· ${t.notes}` : ''}</p>
              </div>
              <div className="flex gap-2">
                <button className="crm-btn-ghost text-xs" onClick={async () => {
                  await fetch('/api/crm/tasks', {
                    method: 'PUT', headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ ...t, done: !t.done, relatedType: 'contact' }),
                  });
                  load();
                }}>{t.done ? <span className='inline-flex items-center gap-1'><CornerUpLeft size={13} /> Undo</span> : <span className='inline-flex items-center gap-1'><Check size={13} /> Done</span>}</button>
                <button className="text-xs text-red-300 inline-flex items-center gap-1" onClick={async () => { await fetch(`/api/crm/tasks?id=${t.id}`, { method: 'DELETE' }); load(); }}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="crm-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Task</th>
                <th className="px-3 py-2 text-left">Contact</th>
                <th className="px-3 py-2 text-left">Due</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className="border-b border-neutral-900">
                  <td className="px-3 py-2">{t.title}</td>
                  <td className="px-3 py-2 text-slate-300">{contactName(t.relatedId)}</td>
                  <td className="px-3 py-2 text-slate-300">{t.dueDate || "—"}</td>
                  <td className="px-3 py-2 text-slate-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2">{t.done ? <span className="text-emerald-300">Done</span> : <span className="text-amber-300">Open</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
