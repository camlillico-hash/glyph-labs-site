"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="mx-auto mt-20 max-w-md crm-card p-6">
      <h1 className="text-2xl font-semibold">🔐 CRM Login</h1>
      <p className="mt-2 text-sm text-slate-400">Use your CRM password to continue.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const res = await fetch("/api/crm/auth", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (!res.ok) return setError("Wrong password");
          window.location.href = "/crm";
        }}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full crm-input"
          placeholder="Password"
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="w-full crm-btn font-semibold">🚀 Login</button>
      </form>
    </div>
  );
}
