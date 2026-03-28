"use client";

import { useEffect, useState } from "react";

type AccountRow = { id: string; name: string; created_at: string };

export default function AccountSwitcher() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    setStatus("");
    const res = await fetch("/api/crm/admin/accounts", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data?.error || "Failed to load accounts");
    setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mt-4 grid gap-3">
      <button className="crm-btn w-fit" onClick={load} type="button">Refresh</button>

      {status && <p className="text-sm text-slate-300">{status}</p>}

      <div className="grid gap-2">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-slate-400">{a.id}</div>
            </div>
            <button
              className="crm-btn"
              type="button"
              onClick={async () => {
                setStatus("");
                const res = await fetch("/api/crm/admin/switch-account", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ accountId: a.id }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) return setStatus(data?.error || "Failed");
                setStatus(`Active account set to: ${a.name}`);
              }}
            >
              Switch
            </button>
          </div>
        ))}
        {!accounts.length && <p className="text-sm text-slate-400">No accounts found yet.</p>}
      </div>
    </div>
  );
}
