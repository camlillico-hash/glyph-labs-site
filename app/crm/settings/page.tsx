import { getStore, storageMode } from "@/lib/crm-store";
import { gmailReady } from "@/lib/gmail";
import { Settings, Mail, Database, Shield } from "lucide-react";

export default async function SettingsPage({ searchParams }: { searchParams?: { gmail?: string; reason?: string; count?: string; activities?: string } }) {
  const store = await getStore();
  const ready = gmailReady();
  const mode = storageMode();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold inline-flex items-center gap-2"><Settings size={20} /> Settings</h1>

      <section className="crm-card p-4">
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Mail size={15} /> Gmail (read-only)</span></h2>
        <p className="mt-2 text-sm text-slate-400">
          Status: {store.gmail.connectedAt ? `Connected (${new Date(store.gmail.connectedAt).toLocaleString()})` : "Not connected"}
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
          <a href="/api/crm/gmail/connect" className="rounded border border-neutral-700 px-3 py-1.5 text-sm">Connect Gmail</a>
          <form action="/api/crm/gmail/sync" method="post">
            <button className="crm-btn text-sm">Sync latest emails</button>
          </form>
        </div>
        <p className="mt-3 text-xs text-slate-500">Synced messages: {store.gmail.messages.length}</p>
        <p className="mt-1 text-xs text-slate-500">Token state: {store.gmail.tokens?.refresh_token ? "refresh token present" : store.gmail.tokens?.access_token ? "access token only" : "no tokens"}</p>
      </section>


      <section className="crm-card p-4">
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Database size={15} /> Data storage</span></h2>
        <p className="mt-2 text-sm text-slate-400">Current mode: <span className="font-semibold text-emerald-300">{mode}</span></p>
        {mode === "file" && (
          <p className="mt-2 text-sm text-amber-300">Set DATABASE_URL to use persistent hosted Postgres (recommended for production).</p>
        )}
      </section>

      <section className="crm-card p-4">
        <h2 className="font-semibold"><span className="inline-flex items-center gap-1.5"><Shield size={15} /> CRM Access</span></h2>
        <p className="mt-2 text-sm text-slate-400">Set CRM_PASSWORD and CRM_SESSION_SECRET in your environment for production.</p>
      </section>
    </div>
  );
}
