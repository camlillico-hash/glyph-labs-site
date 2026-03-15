import { getStore, storageMode } from "@/lib/crm-store";
import { gmailReady } from "@/lib/gmail";
import { Settings, Mail, Database } from "lucide-react";

export const dynamic = "force-dynamic";

function Field({ label, name, value }: { label: string; name: string; value: number }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-slate-300">{label}</span>
      <input
        name={name}
        defaultValue={String(value)}
        inputMode="numeric"
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
    activeClientsTarget: 6,
    reducedHoursClients: 4,
    reducedHoursRevenue: 100000,
    fullExitClients: 6,
    fullExitRevenue: 150000,
    fullExitPotentials: 2,
    warmLeadsAnnualMin: 12,
    warmLeadsAnnualMax: 16,
    introMeetingsAnnualMin: 6,
    introMeetingsAnnualMax: 8,
    discoveriesAnnualMin: 3,
    discoveriesAnnualMax: 4,
    clientsClosedAnnualMin: 3,
    clientsClosedAnnualMax: 4,
    weeklyOutreach: 2,
    weeklyIntroMin: 0,
    weeklyIntroMax: 1,
    weeklyFollowupsMin: 3,
    weeklyFollowupsMax: 5,
    weeklyIntroRequestsMin: 1,
    weeklyIntroRequestsMax: 2,
    ...(store.targets || {}),
  };

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
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Settings size={15} /> Transition targets</span></h2>
        {searchParams?.targets === "saved" && <p className="mt-2 text-sm text-emerald-300">Targets saved.</p>}
        {searchParams?.targets === "error" && <p className="mt-2 text-sm text-rose-300">Could not save targets{searchParams?.reason ? `: ${decodeURIComponent(searchParams.reason)}` : "."}</p>}
        <form action="/api/crm/targets" method="post" className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Active clients target" name="activeClientsTarget" value={targets.activeClientsTarget} />
          <Field label="Reduced-hours clients" name="reducedHoursClients" value={targets.reducedHoursClients} />
          <Field label="Reduced-hours revenue" name="reducedHoursRevenue" value={targets.reducedHoursRevenue} />
          <Field label="Full-exit clients" name="fullExitClients" value={targets.fullExitClients} />
          <Field label="Full-exit revenue" name="fullExitRevenue" value={targets.fullExitRevenue} />
          <Field label="Full-exit potentials" name="fullExitPotentials" value={targets.fullExitPotentials} />

          <Field label="Warm leads annual min" name="warmLeadsAnnualMin" value={targets.warmLeadsAnnualMin} />
          <Field label="Warm leads annual max" name="warmLeadsAnnualMax" value={targets.warmLeadsAnnualMax} />
          <Field label="Intro meetings annual min" name="introMeetingsAnnualMin" value={targets.introMeetingsAnnualMin} />
          <Field label="Intro meetings annual max" name="introMeetingsAnnualMax" value={targets.introMeetingsAnnualMax} />
          <Field label="Discoveries annual min" name="discoveriesAnnualMin" value={targets.discoveriesAnnualMin} />
          <Field label="Discoveries annual max" name="discoveriesAnnualMax" value={targets.discoveriesAnnualMax} />
          <Field label="Clients closed annual min" name="clientsClosedAnnualMin" value={targets.clientsClosedAnnualMin} />
          <Field label="Clients closed annual max" name="clientsClosedAnnualMax" value={targets.clientsClosedAnnualMax} />

          <Field label="Weekly outreach target" name="weeklyOutreach" value={targets.weeklyOutreach} />
          <Field label="Weekly intro min" name="weeklyIntroMin" value={targets.weeklyIntroMin} />
          <Field label="Weekly intro max" name="weeklyIntroMax" value={targets.weeklyIntroMax} />
          <Field label="Weekly follow-ups min" name="weeklyFollowupsMin" value={targets.weeklyFollowupsMin} />
          <Field label="Weekly follow-ups max" name="weeklyFollowupsMax" value={targets.weeklyFollowupsMax} />
          <Field label="Weekly intro requests min" name="weeklyIntroRequestsMin" value={targets.weeklyIntroRequestsMin} />
          <Field label="Weekly intro requests max" name="weeklyIntroRequestsMax" value={targets.weeklyIntroRequestsMax} />

          <div className="md:col-span-2">
            <button className="crm-btn text-sm">Save transition targets</button>
          </div>
        </form>
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
