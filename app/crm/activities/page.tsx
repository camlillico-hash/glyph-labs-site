"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Plus, Save, Trash2, X } from "lucide-react";

const TYPES = [
  { value: "email", label: "Email" },
  { value: "call", label: "Call" },
  { value: "text", label: "Text" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "in_person", label: "In person" },
  { value: "meeting", label: "Meeting" },
  { value: "task_completed", label: "Task completed" },
];

const openPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
  el.showPicker?.();
};

export default function ActivitiesPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ type: "email" });
  const [error, setError] = useState("");

  const load = async () => {
    const c = await (await fetch('/api/crm/contacts', { cache: 'no-store' })).json();
    const a = await (await fetch('/api/crm/activities', { cache: 'no-store' })).json();
    setContacts(Array.isArray(c) ? c : c.contacts || []);
    setActivities(Array.isArray(a) ? a : []);
  };
  useEffect(() => { load(); }, []);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : 'Unknown contact';
  };

  const sorted = useMemo(() => [...activities].sort((a, b) => new Date(b.occurredAt || b.createdAt).getTime() - new Date(a.occurredAt || a.createdAt).getTime()), [activities]);

  async function deleteActivity(activityId: string) {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const res = await fetch(`/api/crm/activities?id=${encodeURIComponent(activityId)}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not delete activity');
      return;
    }
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 whitespace-nowrap"><Activity size={20} /> Activities ({activities.length})</h1>
        <button className="crm-btn inline-flex items-center gap-1.5" onClick={() => { setCreateOpen(true); setDraft({ type: "email", occurredAtLocal: "" }); setError(''); }}><Plus size={14} /> New</button>
      </div>

      <div className="crm-card overflow-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-800 text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Note</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="border-b border-neutral-900">
                <td className="px-3 py-2">{TYPES.find((t) => t.value === a.type)?.label || a.type}</td>
                <td className="px-3 py-2 text-slate-300">{contactName(a.contactId)}</td>
                <td className="px-3 py-2 text-slate-300">{new Date(a.occurredAt || a.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-300">{a.note || "—"}</td>
                <td className="px-3 py-2"><button className="text-xs text-red-300 inline-flex items-center gap-1" onClick={() => deleteActivity(a.id)}><Trash2 size={13} /> Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setCreateOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">New activity</h2>
              <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => setCreateOpen(false)}><X size={14} /> Close</button>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Activity type</label>
                <select className="crm-input" value={draft.type || "email"} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Contact</label>
                <select className="crm-input" value={draft.contactId || ""} onChange={(e) => setDraft({ ...draft, contactId: e.target.value })}>
                  <option value="">Select contact *</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Occurred at</label>
                <input type="datetime-local" className="crm-input" value={draft.occurredAtLocal || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setDraft({ ...draft, occurredAtLocal: e.target.value })} />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Note</label>
                <textarea className="crm-input min-h-28" value={draft.note || ""} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <button className="crm-btn inline-flex items-center gap-1.5" onClick={async () => {
                setError('');
                const res = await fetch('/api/crm/activities', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, occurredAt: draft.occurredAtLocal ? new Date(draft.occurredAtLocal).toISOString() : undefined }) });
                if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not save activity'); return; }
                setCreateOpen(false);
                load();
              }}><Save size={14} /> Save activity</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
