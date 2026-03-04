"use client";

import { useEffect, useMemo, useState } from "react";
import { Handshake, RotateCcw, Trash2 } from "lucide-react";

export default function ClientsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  const load = async () => {
    const d = await (await fetch('/api/crm/deals', { cache: 'no-store' })).json();
    const c = await (await fetch('/api/crm/contacts', { cache: 'no-store' })).json();
    setDeals(d.deals || []);
    setContacts(Array.isArray(c) ? c : c.contacts || []);
  };
  useEffect(() => { load(); }, []);

  const clients = useMemo(() => deals.filter((d) => d.stage === 'Client signed (won)'), [deals]);

  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : '—';
  };

  async function moveBack(deal: any) {
    await fetch('/api/crm/deals', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...deal, stage: 'Verbal Yes' }),
    });
    load();
  }

  async function removeClient(deal: any) {
    if (!confirm('Are you sure you want to remove this client record?')) return;
    await fetch(`/api/crm/deals?id=${deal.id}`, { method: 'DELETE' });
    load();
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
              <th className="px-3 py-2 text-left">Value</th>
              <th className="px-3 py-2 text-left">Signed</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((d) => (
              <tr key={d.id} className="border-b border-neutral-900">
                <td className="px-3 py-2 text-slate-200">{contactName(d.contactId)}</td>
                <td className="px-3 py-2">{d.name || 'Untitled deal'}</td>
                <td className="px-3 py-2 text-slate-300">${d.value || 0}</td>
                <td className="px-3 py-2 text-slate-400">{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="crm-btn-ghost inline-flex items-center gap-1 text-xs" onClick={() => moveBack(d)}><RotateCcw size={13} /> Move back</button>
                    <button className="crm-btn-ghost inline-flex items-center gap-1 text-xs text-red-300" onClick={() => removeClient(d)}><Trash2 size={13} /> Remove</button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={5}>No clients yet. Move a deal to "Client signed (won)" to graduate it here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
