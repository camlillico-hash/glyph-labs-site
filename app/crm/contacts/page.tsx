"use client";

import { useEffect, useMemo, useState } from "react";

type Contact = any;

const CONTACT_STAGES = [
  "New",
  "Attempting",
  "Connected",
  "Discovery meeting booked",
  "Not right now",
];

const contactFields: Array<[string, string, string]> = [
  ["firstName", "First name", "text"],
  ["lastName", "Last name", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone", "text"],
  ["company", "Company", "text"],
  ["title", "Title", "text"],
  ["leadSource", "Lead source", "text"],
];

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<any>({ status: "New" });
  const [gmail, setGmail] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<Contact | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [trayError, setTrayError] = useState("");

  const load = async () => {
    const contactsRes = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setItems(Array.isArray(contactsRes) ? contactsRes : contactsRes.contacts || []);
    setGmail(await (await fetch("/api/crm/gmail/messages", { cache: "no-store" })).json());
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((c) =>
        (`${c.firstName || ""} ${c.lastName || ""} ${c.email || ""} ${c.company || ""}`)
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [items, query]
  );

  function openTray(contact: Contact) {
    setSelected(contact);
    setDraft({ ...contact });
    setEditMode(false);
    setTrayError("");
  }

  async function saveFromTray() {
    if (!draft) return;
    setTrayError("");
    const res = await fetch("/api/crm/contacts", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setTrayError(j.error || "Could not save contact");
      return;
    }
    await load();
    const fresh = await res.json();
    setSelected(fresh);
    setDraft(fresh);
    setEditMode(false);
  }

  async function deleteFromTray() {
    if (!selected?.id) return;
    await fetch(`/api/crm/contacts?id=${selected.id}`, { method: "DELETE" });
    setSelected(null);
    setDraft(null);
    setEditMode(false);
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contacts</h1>
      <div className="crm-card p-4">
        <h2 className="font-semibold">Add contact</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {contactFields.map(([k, label, type]) => (
            <input
              key={k}
              type={type}
              placeholder={label + ((k === "firstName" || k === "lastName") ? " *" : "")}
              className="crm-input"
              value={form[k] || ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ))}
          <select className="crm-input" value={form.status || "New"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {CONTACT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <textarea
          placeholder="Notes"
          className="crm-input mt-2"
          value={form.notes || ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        <button
          className="crm-btn mt-2"
          onClick={async () => {
            setError("");
            const res = await fetch("/api/crm/contacts", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(form),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              setError(j.error || "Could not save contact");
              return;
            }
            setForm({ status: "New" });
            load();
          }}
        >
          Save contact
        </button>
      </div>

      <input
        placeholder="Search contacts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="crm-input"
      />

      <div className="space-y-3">
        {filtered.map((c) => (
          <button
            key={c.id}
            className="crm-card w-full p-4 text-left"
            onClick={() => openTray(c)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{c.firstName} {c.lastName}</p>
                <p className="text-sm text-slate-400">{c.email || "No email"} · {c.company || "No company"}</p>
                <p className="text-xs text-emerald-300">Stage: {c.status || "New"}</p>
                <p className="text-xs text-emerald-300">
                  Gmail matches: {c.email ? gmail.filter((m) => `${m.from || ""} ${m.to || ""}`.toLowerCase().includes(String(c.email).toLowerCase())).length : 0}
                </p>
              </div>
              <span className="text-xs text-slate-400">Open</span>
            </div>
          </button>
        ))}
      </div>

      {selected && draft && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setSelected(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{selected.firstName} {selected.lastName}</h2>
              <button className="crm-btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>

            <div className="mt-4 flex gap-2">
              {!editMode ? (
                <button className="crm-btn" onClick={() => setEditMode(true)}>Edit</button>
              ) : (
                <>
                  <button className="crm-btn" onClick={saveFromTray}>Save</button>
                  <button className="crm-btn-ghost" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}>Cancel</button>
                </>
              )}
              <button className="crm-btn-ghost text-red-300" onClick={deleteFromTray}>Delete</button>
            </div>

            <div className="mt-5 space-y-3 overflow-auto pb-10">
              {contactFields.map(([k, label, type]) => (
                <div key={k}>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{label}</label>
                  {editMode ? (
                    <input type={type} className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                  ) : (
                    <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft[k] || "—"}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Lead stage</label>
                {editMode ? (
                  <select className="crm-input" value={draft.status || "New"} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    {CONTACT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">{draft.status || "New"}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Notes</label>
                {editMode ? (
                  <textarea className="crm-input min-h-28" value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                ) : (
                  <p className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap">{draft.notes || "—"}</p>
                )}
              </div>

              {trayError && <p className="text-sm text-red-300">{trayError}</p>}
              <p className="text-xs text-slate-500">Tip: moving a contact to “Discovery meeting booked” auto-creates a deal in the first deal stage if none exists.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
