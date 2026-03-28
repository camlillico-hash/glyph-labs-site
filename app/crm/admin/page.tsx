export const dynamic = "force-dynamic";

import Link from "next/link";

export const metadata = { title: "CRM Admin" };

async function fetchJson(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export default async function CrmAdminPage() {
  // server component shell; the actual interactions are client-side
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">CRM Admin</h1>
        <Link className="crm-btn" href="/crm">Back to CRM</Link>
      </div>
      <p className="mt-2 text-sm text-slate-400">Create users + accounts, and switch which workspace you’re viewing.</p>

      <div className="mt-6 grid gap-6">
        {/* Create */}
        <div className="crm-card p-5">
          <h2 className="text-lg font-semibold">Create user + fresh account</h2>
          <CreateUserForm />
        </div>

        {/* Switch */}
        <div className="crm-card p-5">
          <h2 className="text-lg font-semibold">Switch active account</h2>
          <AccountSwitcher />
        </div>
      </div>
    </div>
  );
}

// client components
import CreateUserForm from "./parts/CreateUserForm";
import AccountSwitcher from "./parts/AccountSwitcher";
