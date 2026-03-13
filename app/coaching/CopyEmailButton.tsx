"use client";

import { useState } from "react";

export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-neutral-800"
      title="Copy email"
      aria-label="Copy email address"
    >
      <span>{email}</span>
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
    </button>
  );
}
