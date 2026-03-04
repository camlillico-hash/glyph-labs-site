"use client";

import { useEffect, useMemo, useState } from "react";

type Contact = any;

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<any>({});
  const [gmail, setGmail] = useState<any[]>([]);

  const load = async () => {
    setItems(await (await fetch("/api/crm/contacts", { cache: "no-store" })).json());
    setGmail(await (await fetch("/api/crm/gmail/messages", { cache: "no-store" })).json());
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((c) => (`${c.firstName || ""} ${c.lastName || ""} ${c.email || ""} ${c.company || ""}`).toLowerCase().includes(query.toLowerCase())), [items, query]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contacts</h1>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="font-semibold">Add contact</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {[
            ["firstName", "First name"], ["lastName", "Last name"], ["email", "Email"],
            ["phone", "Phone"], ["company", "Company"], ["title", "Title"], ["leadSource", "Lead source"], ["status", "Status"]
          ].map(([k, label]) => (
            <input key={k} placeholder={label} className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5"
              value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
        </div>
        <textarea placeholder="Notes" className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5"
          value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="mt-2 rounded bg-[#036734] px-3 py-1.5"
          onClick={async () => { await fetch('/api/crm/contacts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) }); setForm({}); load(); }}>
          Save contact
        </button>
      </div>

      <input placeholder="Search contacts..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{c.firstName} {c.lastName}</p>
                <p className="text-sm text-slate-400">{c.email || "No email"} · {c.company || "No company"}</p>
                <p className="text-xs text-emerald-300">Gmail matches: {c.email ? gmail.filter((m)=> `${m.from||""} ${m.to||""}`.toLowerCase().includes(String(c.email).toLowerCase())).length : 0}</p>
              </div>
              <button className="text-xs text-red-300" onClick={async () => { await fetch(`/api/crm/contacts?id=${c.id}`, { method: 'DELETE' }); load(); }}>Delete</button>
            </div>
            <textarea className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm" value={c.notes || ""}
              onChange={(e) => setItems(items.map((x) => x.id === c.id ? { ...x, notes: e.target.value } : x))}
              onBlur={async (e) => { await fetch('/api/crm/contacts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...c, notes: e.target.value }) }); }} />
          </div>
        ))}
      </div>
    </div>
  );
}
