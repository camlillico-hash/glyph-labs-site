"use client";

import { useState } from "react";
import { Lock, Rocket, Eye, EyeOff, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto mt-20 max-w-md crm-card p-6">
      <h1 className="text-2xl font-semibold inline-flex items-center gap-2"><Lock size={20} /> <img src="/glyph-crm-logo.png" alt="Glyph CRM logo" className="h-8 w-auto" /> CRM Login</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in with your CRM email + password.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("" );

          // Some browsers/password managers can visually fill inputs without triggering React onChange,
          // leaving state as "". Read the values from the form at submit-time to be safe.
          const form = e.currentTarget;
          const formData = new FormData(form);
          const emailRaw = String(formData.get("email") || "");
          const passwordRaw = String(formData.get("password") || "");

          const res = await fetch("/api/crm/auth", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: emailRaw, password: passwordRaw }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return setError(data?.error || "Login failed");
          }
          window.location.href = "/crm";
        }}
      >
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full crm-input pr-10"
            placeholder="Email"
            autoComplete="username"
            name="email"
          />
          <div className="absolute inset-y-0 right-2 inline-flex items-center text-slate-400">
            <Mail size={16} />
          </div>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full crm-input pr-10"
            placeholder="Password"
            autoComplete="current-password"
            name="password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 inline-flex items-center text-slate-400 hover:text-slate-200"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="w-full crm-btn font-semibold"><span className="inline-flex items-center gap-1.5"><Rocket size={14} /> Login</span></button>
      </form>
    </div>
  );
}
