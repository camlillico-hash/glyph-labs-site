import { getStore, storageMode } from "@/lib/crm-store";
import { gmailReady } from "@/lib/gmail";
import { Settings, Mail, Database } from "lucide-react";

export const dynamic = "force-dynamic";

function Field({ label, name, value, prefix, suffix }: { label: string; name: string; value: number; prefix?: string; suffix?: string }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-slate-300">{label}</span>
      <div className="relative">
        {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span> : null}
        {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{suffix}</span> : null}
        <input
          name={name}
          defaultValue={String(value)}
          inputMode="numeric"
          className={`w-full rounded border border-neutral-700 bg-neutral-900 py-2 text-slate-100 ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"}`}
        />
      </div>
    </label>
  );
}

function DateField({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-slate-300">{label}</span>
      <input
        type="date"
        name={name}
        defaultValue={value}
        className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-slate-100"
      />
    </label>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams?: { gmail?: string; reason?: string; count?: string; activities?: string; targets?: string } }) {
  const store = await getStore();
  const ready = gmailReady();
  const mode = storageMode();
  const targets = {
    revenueGoalAnnual: 160000,
    avgRevenuePerClientAnnual: 25000,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 18)).toISOString().slice(0, 10),
    convWarmToIntro: 50,
    convIntroToDiscovery: 50,
    convDiscoveryToWon: 80,
    ...(store.targets || {}),
  };
  const targetsHistory = Array.isArray(store.targetsHistory) ? store.targetsHistory : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold inline-flex items-center gap-2"><Settings size={20} /> Settings</h1>

      <section className="crm-card p-4">
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Mail size={15} /> Gmail (read-only)</span></h2>
        <p className="mt-2 text-sm text-slate-400">
          Status: {store.gmail.connectedAt ? `Connected (${new Date(store.gmail.connectedAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })} ET)` : "Not connected"}
        </p>
        {searchParams?.gmail === "connected" && <p className="mt-2 text-sm text-emerald-300">Gmail connected successfully.</p>}
        {searchParams?.gmail === "synced" && <p className="mt-2 text-sm text-emerald-300">Sync complete: {searchParams?.count || 0} messages checked, {searchParams?.activities || 0} activities created.</p>}
        {searchParams?.gmail === "error" && <p className="mt-2 text-sm text-rose-300">Gmail connect failed{searchParams?.reason ? `: ${decodeURIComponent(searchParams.reason)}` : "."}</p>}
        {searchParams?.gmail === "sync_error" && <p className="mt-2 text-sm text-rose-300">Gmail sync failed{searchParams?.reason ? `: ${searchParams.reason}` : "."}</p>}
        {!ready && (
          <p className="mt-2 text-sm text-amber-300">
            Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in env to enable connect.
          </p>
        )}
        <div className="mt-3 flex gap-3">
          {store.gmail.connectedAt ? (
            <span className="rounded border border-emerald-700/60 bg-emerald-900/25 px-3 py-1.5 text-sm text-emerald-300">Connected</span>
          ) : (
            <a href="/api/crm/gmail/connect" className="rounded border border-neutral-700 px-3 py-1.5 text-sm">Connect Gmail</a>
          )}
          <form action="/api/crm/gmail/sync" method="post">
            <button className="crm-btn text-sm">Sync latest emails</button>
          </form>
        </div>
        <p className="mt-3 text-xs text-slate-500">Synced messages: {store.gmail.messages.length}</p>
        <p className="mt-1 text-xs text-slate-500">Last sync: {store.gmail.lastSyncedAt ? `${new Date(store.gmail.lastSyncedAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })} ET` : "Never"}</p>
        <p className="mt-1 text-xs text-slate-500">Token state: {store.gmail.tokens?.refresh_token ? "refresh token present" : store.gmail.tokens?.access_token ? "access token only" : "no tokens"}</p>
      </section>


      <section className="crm-card p-4">
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Settings size={15} /> Revenue target inputs</span></h2>
        <p className="mt-1 text-xs text-slate-400">Only key levers are editable. Dashboard targets are auto-calculated.</p>
        {searchParams?.targets === "saved" && <p className="mt-2 text-sm text-emerald-300">Inputs saved and dashboard recalculated.</p>}
        {searchParams?.targets === "error" && <p className="mt-2 text-sm text-rose-300">Could not save inputs{searchParams?.reason ? `: ${decodeURIComponent(searchParams.reason)}` : "."}</p>}
        <form action="/api/crm/targets" method="post" className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Recurring revenue goal (annual CAD)" name="revenueGoalAnnual" value={targets.revenueGoalAnnual} prefix="$" />
          <Field label="Average revenue per client (annual CAD)" name="avgRevenuePerClientAnnual" value={targets.avgRevenuePerClientAnnual} prefix="$" />
          <DateField label="Target date" name="targetDate" value={targets.targetDate} />

          <Field label="Warm lead → Intro conversion" name="convWarmToIntro" value={targets.convWarmToIntro} suffix="%" />
          <Field label="Intro → Discovery conversion" name="convIntroToDiscovery" value={targets.convIntroToDiscovery} suffix="%" />
          <Field label="Discovery → Won conversion" name="convDiscoveryToWon" value={targets.convDiscoveryToWon} suffix="%" />

          <div className="md:col-span-2">
            <button className="crm-btn text-sm">Save planning inputs</button>
          </div>
        </form>

        <details className="mt-4 rounded border border-neutral-700 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-200">Change log</summary>
          <div className="mt-3 space-y-3 text-xs">
            {targetsHistory.length === 0 ? (
              <p className="text-slate-400">No changes recorded yet.</p>
            ) : (
              targetsHistory.map((entry: any, idx: number) => (
                <div key={idx} className="rounded border border-neutral-800 p-2">
                  <p className="text-slate-300">{new Date(entry.changedAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })} ET</p>
                  <p className="mt-1 text-slate-400">Changed: {(entry.changedFields || []).join(", ")}</p>
                </div>
              ))
            )}
          </div>
        </details>
      </section>

      <section className="crm-card p-4">
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Database size={15} /> Data storage</span></h2>
        <p className="mt-2 text-sm text-slate-400">Current mode: <span className="font-semibold text-emerald-300">{mode}</span></p>
        {mode === "file" && (
          <p className="mt-2 text-sm text-amber-300">Set DATABASE_URL to use persistent hosted Postgres (recommended for production).</p>
        )}
      </section>
    </div>
  );
}
