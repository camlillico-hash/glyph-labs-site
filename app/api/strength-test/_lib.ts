import { getStore, id, now, saveStore, type StrengthTestSubmission } from "@/lib/crm-store";
import { getCrmPool } from "@/lib/crm-db";

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizeString(value: unknown) {
  const v = String(value || "").trim();
  return v || undefined;
}

function applyStrengthTestLeadDefaults(contact: any, timestamp: string) {
  contact.pipelineType = "icp";
  contact.type = contact.type || "Prospect";
  contact.leadSource = "Strength Test";
  contact.status = contact.status || "New";
  contact.updatedAt = timestamp;
  return contact;
}

export async function resolveStrengthTestAccountId() {
  const explicit =
    String(process.env.STRENGTH_TEST_ACCOUNT_ID || "").trim() ||
    String(process.env.CRM_DEFAULT_ACCOUNT_ID || "").trim();
  if (explicit) return explicit;

  const pool = getCrmPool();
  if (!pool) return undefined;

  const populated = await pool.query(
    `
    with counts as (
      select account_id, count(*)::int as row_count from crm_contacts where account_id is not null group by account_id
      union all
      select account_id, count(*)::int as row_count from crm_deals where account_id is not null group by account_id
      union all
      select account_id, count(*)::int as row_count from crm_tasks where account_id is not null group by account_id
      union all
      select account_id, count(*)::int as row_count from crm_activities where account_id is not null group by account_id
    )
    select account_id, sum(row_count)::int as total_rows
    from counts
    group by account_id
    order by total_rows desc
    limit 1
    `
  );
  const populatedAccountId = populated.rows[0]?.account_id as string | undefined;
  if (populatedAccountId) return populatedAccountId;

  const firstAccount = await pool.query(
    `select id from crm_accounts order by created_at asc limit 1`
  );
  return firstAccount.rows[0]?.id as string | undefined;
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

export async function saveStrengthTestStore(store: any, accountId?: string) {
  await saveStore(store, accountId);
}

export function migrateLegacyStrengthTests(params: {
  legacyStore: any;
  targetStore: any;
  timestamp?: string;
}) {
  const { legacyStore, targetStore } = params;
  const timestamp = params.timestamp || now();
  const legacySubmissions = Array.isArray(legacyStore?.strengthTests) ? legacyStore.strengthTests : [];
  const targetEmails = new Map<string, any>();
  const targetSubmissionIds = new Set((targetStore.strengthTests || []).map((s: StrengthTestSubmission) => s.id));
  const targetSubmissionFingerprints = new Set(
    (targetStore.strengthTests || []).map((s: StrengthTestSubmission) => `${s.contactId}|${s.submittedAt}|${s.overallScore}`)
  );

  for (const contact of targetStore.contacts || []) {
    const email = normalizeEmail(contact?.email);
    if (email) targetEmails.set(email, contact);
  }

  let contactsCreated = 0;
  let contactsUpdated = 0;
  let submissionsMigrated = 0;
  let activitiesAdded = 0;

  for (const submission of legacySubmissions) {
    const legacyContact = (legacyStore.contacts || []).find((c: any) => c.id === submission.contactId);
    const email = normalizeEmail(legacyContact?.email);
    if (!email) continue;

    let targetContact = targetEmails.get(email);
    if (!targetContact) {
      targetContact = applyStrengthTestLeadDefaults(
        {
          id: id(),
          firstName: normalizeString(legacyContact?.firstName),
          lastName: normalizeString(legacyContact?.lastName),
          company: normalizeString(legacyContact?.company),
          email,
          phone: normalizeString(legacyContact?.phone),
          strengthTest: "Yes",
          createdAt: legacyContact?.createdAt || submission.submittedAt || timestamp,
          updatedAt: timestamp,
        },
        timestamp
      );
      targetStore.contacts.unshift(targetContact);
      targetEmails.set(email, targetContact);
      contactsCreated += 1;
    } else {
      targetContact.firstName = normalizeString(targetContact.firstName) || normalizeString(legacyContact?.firstName);
      targetContact.lastName = normalizeString(targetContact.lastName) || normalizeString(legacyContact?.lastName);
      targetContact.company = normalizeString(targetContact.company) || normalizeString(legacyContact?.company);
      targetContact.phone = normalizeString(targetContact.phone) || normalizeString(legacyContact?.phone);
      targetContact.email = email;
      targetContact.strengthTest = "Yes";
      applyStrengthTestLeadDefaults(targetContact, timestamp);
      contactsUpdated += 1;
    }

    const fingerprint = `${targetContact.id}|${submission.submittedAt}|${submission.overallScore}`;
    if (targetSubmissionIds.has(submission.id) || targetSubmissionFingerprints.has(fingerprint)) {
      continue;
    }

    const migratedSubmission: StrengthTestSubmission = {
      ...submission,
      contactId: targetContact.id,
      status: submission.status || "complete",
      pdfFilename: submission.pdfFilename || `strength-test-${(targetContact.lastName || "lead").replace(/\s+/g, "-").toLowerCase()}-${submission.id}.pdf`,
    };

    targetStore.strengthTests = [migratedSubmission, ...(targetStore.strengthTests || [])];
    targetSubmissionIds.add(migratedSubmission.id);
    targetSubmissionFingerprints.add(fingerprint);
    submissionsMigrated += 1;

    const note = `Strength Test submitted — Overall ${submission.overallScore}%. PDF: /api/strength-test/submissions/${submission.id}/pdf`;
    const activityExists = (targetStore.activities || []).some(
      (activity: any) =>
        activity.contactId === targetContact.id &&
        activity.note === note &&
        activity.occurredAt === submission.submittedAt
    );

    if (!activityExists) {
      targetStore.activities.unshift({
        id: id(),
        contactId: targetContact.id,
        type: "meeting",
        note,
        occurredAt: submission.submittedAt,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      activitiesAdded += 1;
    }
  }

  return {
    changed: submissionsMigrated > 0 || contactsCreated > 0 || activitiesAdded > 0,
    summary: {
      contactsCreated,
      contactsUpdated,
      submissionsMigrated,
      activitiesAdded,
    },
  };
}

export async function getStrengthTestStore() {
  const accountId = await resolveStrengthTestAccountId();
  const store = await getStore(accountId);
  const legacyStore = await getStore();
  const migration = migrateLegacyStrengthTests({
    legacyStore,
    targetStore: store,
    timestamp: now(),
  });

  if (migration.changed) {
    await saveStore(store, accountId);
  }

  return { accountId, store };
}
