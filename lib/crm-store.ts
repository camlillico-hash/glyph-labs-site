import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Contact = { id: string; firstName?: string; lastName?: string; email?: string; phone?: string; company?: string; title?: string; leadSource?: string; status?: string; tags?: string[]; notes?: string; createdAt: string; updatedAt: string; };
export type Deal = { id: string; name?: string; contactId?: string; company?: string; stage: string; value?: number; probability?: number; expectedCloseDate?: string; nextStep?: string; lastActivityAt?: string; notes?: string; createdAt: string; updatedAt: string; };
export type Task = { id: string; title: string; relatedType?: "contact" | "deal"; relatedId?: string; dueDate?: string; done: boolean; notes?: string; createdAt: string; updatedAt: string; };
export type GmailMessage = { id: string; threadId?: string; from?: string; to?: string; subject?: string; date?: string; snippet?: string; };

type CrmStore = { contacts: Contact[]; deals: Deal[]; tasks: Task[]; gmail: { connectedAt?: string; messages: GmailMessage[]; tokens?: { access_token?: string; refresh_token?: string; expiry_date?: number; }; }; };

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "crm.json");

const initialStore: CrmStore = { contacts: [], deals: [], tasks: [], gmail: { messages: [] } };

export const DEAL_STAGES = ["Discovery meeting booked", "90-minute booked", "90-minute complete", "Verbal Yes", "Client signed (won)", "Lost"] as const;

export async function getStore(): Promise<CrmStore> {
  await mkdir(dataDir, { recursive: true });
  try {
    const parsed = JSON.parse(await readFile(dbPath, "utf8")) as CrmStore;
    return { ...initialStore, ...parsed, gmail: { ...initialStore.gmail, ...(parsed.gmail || {}), messages: parsed.gmail?.messages || [] } };
  } catch {
    await writeFile(dbPath, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
}

export async function saveStore(store: CrmStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(store, null, 2));
}

export const id = () => Math.random().toString(36).slice(2, 10);
export const now = () => new Date().toISOString();
