import { getStore } from "@/lib/crm-store";
import { gmailReady } from "@/lib/gmail";

export default async function SettingsPage() {
  const store = await getStore();
  const ready = gmailReady();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="font-semibold">Gmail (read-only)</h2>
        <p className="mt-2 text-sm text-slate-400">
          Status: {store.gmail.connectedAt ? `Connected (${new Date(store.gmail.connectedAt).toLocaleString()})` : "Not connected"}
        </p>
        {!ready && (
          <p className="mt-2 text-sm text-amber-300">
            Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in env to enable connect.
          </p>
        )}
        <div className="mt-3 flex gap-3">
          <a href="/api/crm/gmail/connect" className="rounded border border-neutral-700 px-3 py-1.5 text-sm">Connect Gmail</a>
          <form action="/api/crm/gmail/sync" method="post">
            <button className="rounded bg-[#036734] px-3 py-1.5 text-sm">Sync latest emails</button>
          </form>
        </div>
        <p className="mt-3 text-xs text-slate-500">Synced messages: {store.gmail.messages.length}</p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="font-semibold">CRM Access</h2>
        <p className="mt-2 text-sm text-slate-400">Set CRM_PASSWORD and CRM_SESSION_SECRET in your environment for production.</p>
      </section>
    </div>
  );
}
