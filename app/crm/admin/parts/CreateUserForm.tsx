"use client";

import { useState } from "react";

export default function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [status, setStatus] = useState<string>("");

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("");
        const res = await fetch("/api/crm/admin/create-user", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, accountName }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return setStatus(data?.error || "Failed");
        setStatus(`Created user + account (accountId: ${data.accountId})`);
        setEmail("");
        setPassword("");
        setAccountName("");
      }}
    >
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">Account name</label>
        <input className="crm-input" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. John Smith" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">User email</label>
        <input className="crm-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">Temp password</label>
        <input className="crm-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password" />
      </div>

      {status && <p className="text-sm text-slate-300">{status}</p>}

      <button className="crm-btn w-fit">Create</button>
    </form>
  );
}
