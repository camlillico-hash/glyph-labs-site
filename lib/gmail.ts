import { google } from "googleapis";
import { getStore, saveStore } from "./crm-store";

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

export function getGoogleAuthUrl() {
  const client = getOauthClient();
  if (!client) return null;
  return client.generateAuthUrl({ access_type: "offline", scope: SCOPES, prompt: "consent" });
}

export async function storeGoogleCode(code: string) {
  const client = getOauthClient();
  if (!client) throw new Error("Google OAuth env missing");
  const { tokens } = await client.getToken(code);
  const store = await getStore();
  store.gmail.tokens = {
    access_token: tokens.access_token || undefined,
    refresh_token: tokens.refresh_token || store.gmail.tokens?.refresh_token,
    expiry_date: tokens.expiry_date || undefined,
  };
  store.gmail.connectedAt = new Date().toISOString();
  await saveStore(store);
}

export async function syncGmailMessages() {
  const client = getOauthClient();
  if (!client) throw new Error("Google OAuth env missing");
  const store = await getStore();
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
  await saveStore(store);
  return { count: messages.length };
}
