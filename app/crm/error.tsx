"use client";

import Link from "next/link";

export default function CrmError({ reset }: { reset: () => void }) {
  return (
    <div className="crm-shell flex min-h-screen flex-col text-slate-100">
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="crm-card p-6 space-y-4">
          <h1 className="text-2xl font-semibold">CRM hit a snag</h1>
          <p className="text-slate-300">Something failed while loading this CRM view. You can retry now.</p>
          <div className="flex gap-3">
            <button onClick={() => reset()} className="crm-btn">Retry</button>
            <Link href="/crm/login" className="rounded border border-neutral-700 px-3 py-1.5 text-sm">Back to login</Link>
            <Link href="/crm/settings" className="rounded border border-neutral-700 px-3 py-1.5 text-sm">Open settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
