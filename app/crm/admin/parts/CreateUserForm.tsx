"use client";

import { useEffect, useState } from "react";

type Account = { id: string; name: string };

async function postJson(path: string, body: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export default function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [attachEmail, setAttachEmail] = useState("");
  const [attachAccountId, setAttachAccountId] = useState("");
  const [attachRole, setAttachRole] = useState("owner");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [attachStatus, setAttachStatus] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    fetch("/api/crm/admin/accounts", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load accounts");
        setAccounts(data?.accounts || []);
      })
      .catch((e) => setAttachStatus(String(e?.message || "Failed to load accounts")));
  }, []);

  return (
    <div className="mt-4 grid gap-6">
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setCreateStatus("");
          try {
            const data = await postJson("/api/crm/admin/create-user", { email, password, accountName });
            setCreateStatus(`Created user + account (accountId: ${data.accountId})`);
            setEmail("");
            setPassword("");
            setAccountName("");
          } catch (err: any) {
            setCreateStatus(String(err?.message || "Failed"));
          }
        }}
      >
        <div>
          <h3 className="text-base font-semibold">Create user + fresh account</h3>
          <p className="mt-1 text-sm text-slate-400">Use this for a brand new person with a brand new email.</p>
        </div>

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

        {createStatus && <p className="text-sm text-slate-300">{createStatus}</p>}

        <button className="crm-btn w-fit">Create</button>
      </form>

      <form
        className="grid gap-3 border-t border-slate-800 pt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setAttachStatus("");
          try {
            const data = await postJson("/api/crm/admin/attach-user", {
              email: attachEmail,
              accountId: attachAccountId,
              role: attachRole,
            });
            setAttachStatus(`Attached existing user to account ${data.accountId} as ${data.role}`);
            setAttachEmail("");
          } catch (err: any) {
            setAttachStatus(String(err?.message || "Failed"));
          }
        }}
      >
        <div>
          <h3 className="text-base font-semibold">Attach existing user to account</h3>
          <p className="mt-1 text-sm text-slate-400">Use this when the email already exists and you want to grant account access.</p>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Existing user email</label>
          <input className="crm-input" type="email" value={attachEmail} onChange={(e) => setAttachEmail(e.target.value)} placeholder="name@domain.com" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Account</label>
          <select className="crm-input" value={attachAccountId} onChange={(e) => setAttachAccountId(e.target.value)}>
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.id})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Role in account</label>
          <select className="crm-input" value={attachRole} onChange={(e) => setAttachRole(e.target.value)}>
            <option value="owner">owner</option>
            <option value="admin">admin</option>
            <option value="member">member</option>
          </select>
        </div>

        {attachStatus && <p className="text-sm text-slate-300">{attachStatus}</p>}

        <button className="crm-btn w-fit">Attach existing user</button>
      </form>

      <form
        className="grid gap-3 border-t border-slate-800 pt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setResetStatus("");
          try {
            await postJson("/api/crm/admin/reset-password", {
              email: resetEmail,
              password: resetPassword,
            });
            setResetStatus("Password reset successfully");
            setResetEmail("");
            setResetPassword("");
          } catch (err: any) {
            setResetStatus(String(err?.message || "Failed"));
          }
        }}
      >
        <div>
          <h3 className="text-base font-semibold">Reset existing user password</h3>
          <p className="mt-1 text-sm text-slate-400">Use this when the user already exists and just needs a new password.</p>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Existing user email</label>
          <input className="crm-input" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="name@domain.com" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-300">New password</label>
          <input className="crm-input" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Set a new password" />
        </div>

        {resetStatus && <p className="text-sm text-slate-300">{resetStatus}</p>}

        <button className="crm-btn w-fit">Reset password</button>
      </form>
    </div>
  );
}
