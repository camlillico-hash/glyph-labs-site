import { getStore, id, now, saveStore } from "@/lib/crm-store";
import { resolveActiveAccountId } from "@/lib/crm-scope";

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function applyStrengthTestLeadDefaults(contact: any, timestamp: string) {
  contact.pipelineType = "icp";
  contact.type = contact.type || "Prospect";
  contact.leadSource = "Strength Test";
  contact.status = contact.status || "New";
  contact.updatedAt = timestamp;
  return contact;
}

export async function getStrengthTestStore() {
  const accountId = await resolveActiveAccountId();
  const store = await getStore(accountId);
  return { accountId, store };
}

export function findStrengthTestLeadByEmail(store: any, email: string) {
  return (store.contacts || []).find((c: any) => normalizeEmail(c.email) === email);
}

export function ensureStrengthTestLead(params: {
  store: any;
  timestamp: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string;
}) {
  const { store, timestamp, firstName, lastName, company, email, phone } = params;
  let contact = findStrengthTestLeadByEmail(store, email);

  if (!contact) {
    contact = applyStrengthTestLeadDefaults(
      {
        id: id(),
        firstName,
        lastName,
        company,
        email,
        phone,
        strengthTest: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      timestamp
    );
    store.contacts.unshift(contact);
    return contact;
  }

  contact.firstName = firstName;
  contact.lastName = lastName;
  contact.company = company;
  contact.email = email;
  contact.phone = phone || contact.phone;
  applyStrengthTestLeadDefaults(contact, timestamp);
  return contact;
}

export async function saveStrengthTestStore(store: any, accountId: string) {
  await saveStore(store, accountId);
}
