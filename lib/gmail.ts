import { google } from "googleapis";
import { getStore, id, now, saveStore } from "./crm-store";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

function getOauthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirect) return null;
  return new google.auth.OAuth2(clientId, clientSecret, redirect);
}

export function gmailReady() {
  return !!getOauthClient();
}

export function getGoogleAuthUrl(state?: string) {
  const client = getOauthClient();
  if (!client) return null;
  return client.generateAuthUrl({ access_type: "offline", scope: SCOPES, prompt: "consent", ...(state ? { state } : {}) });
}

export async function storeGoogleCode(code: string, accountId: string) {
  const client = getOauthClient();
  if (!client) throw new Error("Google OAuth env missing");
  const { tokens } = await client.getToken(code);
  const store = await getStore(accountId);
  store.gmail.tokens = {
    access_token: tokens.access_token || undefined,
    refresh_token: tokens.refresh_token || store.gmail.tokens?.refresh_token,
    expiry_date: tokens.expiry_date || undefined,
  };
  store.gmail.connectedAt = new Date().toISOString();
  await saveStore(store, accountId);
}

function extractEmails(headerValue: string) {
  const matches = String(headerValue || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return [...new Set(matches.map((e) => e.toLowerCase()))];
}

function isLikelyNewsletter(msg: any) {
  const from = String(msg.from || "").toLowerCase();
  const subject = String(msg.subject || "").toLowerCase();
  const snippet = String(msg.snippet || "").toLowerCase();
  return from.includes("no-reply") || from.includes("noreply") || subject.includes("unsubscribe") || snippet.includes("unsubscribe");
}

export async function syncGmailMessages(accountId: string) {
  const client = getOauthClient();
  if (!client) throw new Error("Google OAuth env missing");
  const store = await getStore(accountId);
  if (!store.gmail.tokens?.access_token && !store.gmail.tokens?.refresh_token) {
    throw new Error("No Gmail tokens found");
  }
  client.setCredentials(store.gmail.tokens);
  const gmail = google.gmail({ version: "v1", auth: client });
  const list = await gmail.users.messages.list({ userId: "me", maxResults: 50 });
  const ids = list.data.messages || [];
  const messages = [] as any[];
  for (const m of ids.slice(0, 25)) {
    const full = await gmail.users.messages.get({ userId: "me", id: m.id!, format: "metadata", metadataHeaders: ["From", "To", "Subject", "Date"] });
    const headers = full.data.payload?.headers || [];
    const h = (name: string) => headers.find((x) => x.name?.toLowerCase() === name.toLowerCase())?.value || "";
    messages.push({
      id: full.data.id!,
      threadId: full.data.threadId || "",
      from: h("From"),
      to: h("To"),
      subject: h("Subject"),
      date: h("Date"),
      snippet: full.data.snippet || "",
    });
  }
  store.gmail.messages = messages;
  store.gmail.lastSyncedAt = now();

  // Auto-log email activities against matched contacts (by email address)
  const contacts = store.contacts || [];
  const emailToContactIds = new Map<string, string[]>();
  for (const c of contacts as any[]) {
    const e = String(c.email || "").trim().toLowerCase();
    if (!e) continue;
    const arr = emailToContactIds.get(e) || [];
    arr.push(c.id);
    emailToContactIds.set(e, arr);
  }

  const existingKeys = new Set(
    (store.activities || [])
      .map((a: any) => a.gmailMessageId && a.contactId ? `${a.gmailMessageId}:${a.contactId}` : null)
      .filter(Boolean)
  );

  let activityCount = 0;
  for (const m of messages) {
    if (isLikelyNewsletter(m)) continue;
    const fromEmails = extractEmails(m.from);
    const toEmails = extractEmails(m.to);
    const allEmails = [...new Set([...fromEmails, ...toEmails])];

    const matchedContactIds = new Set<string>();
    for (const e of allEmails) {
      for (const cid of (emailToContactIds.get(e) || [])) matchedContactIds.add(cid);
    }

    for (const contactId of matchedContactIds) {
      const key = `${m.id}:${contactId}`;
      if (existingKeys.has(key)) continue;

      const contact = contacts.find((c: any) => c.id === contactId);
      const contactEmail = String(contact?.email || "").toLowerCase();
      const direction = fromEmails.includes(contactEmail) ? "Outbound" : "Inbound";
      const note = `${direction} email — ${m.subject || "(No subject)"}\n${m.snippet || ""}`.trim();
      const occurredAt = m.date ? new Date(m.date).toISOString() : now();

      (store.activities as any[]).unshift({
        id: id(),
        contactId,
        type: "email",
        note,
        occurredAt,
        createdAt: now(),
        updatedAt: now(),
        gmailMessageId: m.id,
        gmailThreadId: m.threadId || "",
      });
      const cidx = (store.contacts || []).findIndex((c: any) => c.id === contactId);
      if (cidx >= 0) {
        store.contacts[cidx] = {
          ...store.contacts[cidx],
          lastActivityDate: occurredAt,
          lastActivityType: "email",
          updatedAt: now(),
        };
      }
      existingKeys.add(key);
      activityCount++;
    }
  }

  await saveStore(store, accountId);
  return { count: messages.length, activitiesCreated: activityCount };
}
