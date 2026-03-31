"use client";

import { useEffect, useMemo, useState } from "react";
import { Handshake, RotateCcw, Trash2, X, Save, Pencil, SquareArrowOutUpRight } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

const money = (n?: number) => `$${Math.round(Number(n || 0)).toLocaleString()}`;

export default function ClientsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; action: (() => void) | null }>({ open: false, message: "", action: null });

  const load = async () => {
    const d = await (await fetch('/api/crm/deals', { cache: 'no-store' })).json();
    const c = await (await fetch('/api/crm/contacts', { cache: 'no-store' })).json();
    setDeals(d.deals || []);
    setContacts(Array.isArray(c) ? c : c.contacts || []);
  };
  useEffect(() => { load(); }, []);

  const clients = useMemo(() => deals.filter((d) => d.stage === 'Launch paid (won)'), [deals]);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : '—';
  };

  function openTray(deal: any) { setSelected(deal); setDraft({ ...deal }); setEditMode(false); setError(""); }
  function closeTray() { setSelected(null); setDraft(null); setEditMode(false); setError(""); }

  async function saveDeal() {
    if (!draft) return;
    setError("");
    const res = await fetch('/api/crm/deals', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not save deal'); return; }
    await load();
    closeTray();
  }

  async function moveBack(deal: any) {
    await fetch('/api/crm/deals', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...deal, stage: 'Proposal / commitment' }),
    });
    load();
  }

  async function removeClient(deal: any) {
    setConfirmState({
      open: true,
      message: 'Are you sure you want to remove this client record?',
      action: async () => {
        await fetch(`/api/crm/deals?id=${deal.id}`, { method: 'DELETE' });
        load();
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-emerald-200 whitespace-nowrap"><Handshake size={20} /> Clients ({clients.length})</h1>
      </div>

      <div className="crm-card overflow-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-800 text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-left">Deal</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Signed</th>
              <th className="px-3 py-2 text-left">Client stage</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((d) => (
              <tr key={d.id} className="border-b border-neutral-900">
                <td className="px-3 py-2 text-slate-200">{d.contactId ? <a className="text-sky-300 hover:text-sky-200" href={`/crm/contacts?contactId=${d.contactId}`}>{contactName(d.contactId)}</a> : 'Unknown contact'}</td>
                <td className="px-3 py-2">{d.name || 'Untitled deal'}</td>
                <td className="px-3 py-2 text-slate-300">{money(d.value)}</td>
                <td className="px-3 py-2 text-slate-400">{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : '—'}</td>
                <td className="px-3 py-2 text-slate-300">{d.clientStage || 'Launch'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="crm-btn-ghost inline-flex items-center gap-1 text-xs" title="Open tray" aria-label="Open tray" onClick={() => openTray(d)}><SquareArrowOutUpRight size={14} /></button>
                    <button className="crm-btn-ghost inline-flex items-center gap-1 text-xs" onClick={() => moveBack(d)}><RotateCcw size={13} /> Move back</button>
                    <button className="crm-btn-ghost inline-flex items-center gap-1 text-xs text-red-300" title="Remove" aria-label="Remove" onClick={() => removeClient(d)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={6}>No clients yet. Move a deal to "Launch paid (won)" to graduate it here.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        confirmLabel="Remove"
        onCancel={() => setConfirmState({ open: false, message: "", action: null })}
        onConfirm={() => {
          const action = confirmState.action;
          setConfirmState({ open: false, message: "", action: null });
          action?.();
        }}
      />

      {draft && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={closeTray} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{selected?.name || "Client deal"}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex gap-2">
              {!editMode ? <button className="crm-btn inline-flex items-center gap-1.5" title="Open" aria-label="Open" onClick={() => setEditMode(true)}><Pencil size={14} /></button> : <button className="crm-btn inline-flex items-center gap-1.5" title="Save" aria-label="Save" onClick={saveDeal}><Save size={14} className="text-emerald-300" /></button>}
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Deal name</label>{editMode ? <input className="crm-input" value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.name || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Stage</label>{editMode ? <select className="crm-input" value={draft.stage || 'Launch paid (won)'} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}><option value="Proposal / commitment">Proposal / commitment</option><option value="Launch paid (won)">Launch paid (won)</option><option value="Lost">Lost</option></select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.stage || '—'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Client stage</label>{editMode ? <select className="crm-input" value={draft.clientStage || 'Launch'} onChange={(e) => setDraft({ ...draft, clientStage: e.target.value })}><option value="Launch">Launch</option><option value="Active rhythm">Active rhythm</option></select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.clientStage || 'Launch'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Launch included</label>{editMode ? <select className="crm-input" value={draft.launchIncluded || 'Yes'} onChange={(e) => setDraft({ ...draft, launchIncluded: e.target.value })}><option value="Yes">Yes</option><option value="No">No</option></select> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.launchIncluded || 'Yes'}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Daily rate</label>{editMode ? <input type="number" className="crm-input" value={draft.dailyRate || 5000} onChange={(e) => setDraft({ ...draft, dailyRate: Number(e.target.value || 5000) })} /> : <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{money(draft.dailyRate || 5000)}</p>}</div>
              <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Amount</label><p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{money(draft.value)}</p></div>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
