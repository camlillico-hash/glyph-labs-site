import { NextResponse } from "next/server";
import { buildActivitySummary, buildContactBrief, buildDailyDigest, buildDealBrief, buildPipelineHealth, compareActualsToTargets, listDueOrOverdueTasks, listRecentActivities } from "@/lib/crm-analytics";
import { getStore, id, now, recordLeadStage, saveStore } from "@/lib/crm-store";
import { advanceContactToAttemptingOnActivity } from "@/lib/crm-stage-transitions";
import { isAllowedCrmMcpOrigin, resolveCrmMcpAccountId } from "@/lib/crm-mcp-auth";
import { oauthChallenge, oauthEnabled, resolveCrmMcpPrincipal } from "@/lib/crm-mcp-oauth";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const PROTOCOL_VERSION = "2025-03-26";
const SERVER_INFO = {
  name: "glyph-crm",
  title: "Glyph CRM",
  version: "1.0.0",
};

const WRITE_TOOLS = new Set(["create_outbound_lead", "update_outbound_lead", "log_sent_outreach"]);

const TOOLS = [
  {
    name: "get_daily_digest",
    title: "Get Daily CRM Digest",
    description: "Summarize daily CRM execution, activity volume, due tasks, stale deals, and focus items.",
    inputSchema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Optional date in YYYY-MM-DD format. Defaults to today.",
        },
        accountId: {
          type: "string",
          description: "Optional CRM account ID. Only used when account override is enabled server-side.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_activity_summary",
    title: "Get Activity Summary",
    description: "Summarize CRM activity for a time window such as last_7_days or last_30_days.",
    inputSchema: {
      type: "object",
      properties: {
        window: {
          type: "string",
          enum: ["today", "yesterday", "this_week", "last_7_days", "last_30_days"],
        },
        accountId: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_pipeline_health",
    title: "Get Pipeline Health",
    description: "Report open deals, stale deals, overdue tasks, and whether weekly pace is ahead or behind.",
    inputSchema: {
      type: "object",
      properties: {
        window: {
          type: "string",
          enum: ["today", "yesterday", "this_week", "last_7_days", "last_30_days"],
        },
        accountId: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_recent_activities",
    title: "List Recent Activities",
    description: "List recent CRM activities, optionally filtered by contact or type.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", minimum: 1, maximum: 100 },
        contactId: { type: "string" },
        type: {
          type: "string",
          enum: ["email", "call", "text", "linkedin", "in_person", "meeting", "task_completed"],
        },
        accountId: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_due_or_overdue_tasks",
    title: "List Due Or Overdue Tasks",
    description: "List CRM follow-up tasks that are due today or overdue.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", minimum: 1, maximum: 100 },
        accountId: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_contact_brief",
    title: "Get Contact Brief",
    description: "Get a CRM brief for one contact, including recent activities, tasks, and linked deals.",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        accountId: { type: "string" },
      },
      required: ["contactId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_deal_brief",
    title: "Get Deal Brief",
    description: "Get a CRM brief for one deal, including recent activity, tasks, and linked contact context.",
    inputSchema: {
      type: "object",
      properties: {
        dealId: { type: "string" },
        accountId: { type: "string" },
      },
      required: ["dealId"],
      additionalProperties: false,
    },
  },
  {
    name: "compare_actuals_to_targets",
    title: "Compare Actuals To Targets",
    description: "Compare current CRM funnel state to the configured revenue and conversion targets.",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          enum: ["current_account"],
          description: "Use current_account for the default CRM account context.",
        },
        accountId: { type: "string" },
      },
      required: ["scope"],
      additionalProperties: false,
    },
  },
  {
    name: "select_outbound_leads",
    title: "Select Outbound Leads",
    description: "Find eligible ICP leads by stage, LinkedIn acceptance, and last activity. Always excludes do-not-contact leads. Read-only; does not send or log outreach.",
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["New", "Attempting", "Connected", "Nurture"] },
        liAccepted: { type: "boolean" },
        lastActivityBefore: { type: "string", description: "Exclusive cutoff in YYYY-MM-DD format. Leads without activity are included." },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "find_outbound_leads",
    title: "Find Outbound Leads",
    description: "Find existing ICP leads by name, company, email, or LinkedIn URL before creating or updating a record. Includes do-not-contact status for identification; do not use this tool as an outreach eligibility list.",
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 50 } },
      required: ["query"], additionalProperties: false,
    },
  },
  {
    name: "create_outbound_lead",
    title: "Create Outbound Lead",
    description: "Create one ICP lead after checking for duplicates by email, LinkedIn URL, or name and company. Does not contact the lead.",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    inputSchema: {
      type: "object",
      properties: {
        firstName: { type: "string" }, lastName: { type: "string" },
        company: { type: "string" }, title: { type: "string" },
        email: { type: "string" }, linkedin: { type: "string" },
        notes: { type: "string" }, liAccepted: { type: "boolean" },
        doNotContact: { type: "boolean" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "update_outbound_lead",
    title: "Update Outbound Lead",
    description: "Update selected fields of an existing ICP lead. Requires its CRM ID. Cannot clear a do-not-contact flag or record outreach.",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" }, firstName: { type: "string" },
        lastName: { type: "string" }, company: { type: "string" },
        title: { type: "string" }, email: { type: "string" },
        linkedin: { type: "string" }, notes: { type: "string" },
        status: { type: "string", enum: ["New", "Attempting", "Connected"] },
        liAccepted: { type: "boolean" }, doNotContact: { type: "boolean" },
      },
      required: ["contactId"], additionalProperties: false,
    },
  },
  {
    name: "prepare_outreach_draft",
    title: "Prepare Outreach Draft Context",
    description: "Return one eligible lead and its CRM history for drafting a message for user review. Does not save, send, or log a draft. Refuses do-not-contact leads.",
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: "object",
      properties: { contactId: { type: "string" } },
      required: ["contactId"], additionalProperties: false,
    },
  },
  {
    name: "log_sent_outreach",
    title: "Log Sent Outreach",
    description: "Record outreach only after it was actually sent and verified in the destination. Requires a channel, exact message, and external sent-message ID or URL. Refuses do-not-contact leads and duplicate external IDs. This tool does not send a message.",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        channel: { type: "string", enum: ["linkedin", "email", "text"] },
        message: { type: "string" },
        externalMessageId: { type: "string", description: "Provider message ID or stable URL proving the send." },
        occurredAt: { type: "string", description: "ISO timestamp of the actual send. Defaults to now." },
      },
      required: ["contactId", "channel", "message", "externalMessageId"],
      additionalProperties: false,
    },
  },
] as const;

function jsonRpcResult(id: JsonRpcRequest["id"], result: unknown, init?: ResponseInit) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, init);
}

function jsonRpcError(id: JsonRpcRequest["id"], code: number, message: string, init?: ResponseInit) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, init);
}

function accepted() {
  return new NextResponse(null, { status: 202 });
}

function formatToolResult(title: string, structuredContent: unknown, lines: string[]) {
  return {
    content: [
      {
        type: "text",
        text: `${title}\n\n${lines.join("\n")}\n\nJSON:\n${JSON.stringify(structuredContent, null, 2)}`,
      },
    ],
    structuredContent,
  };
}

async function loadSnapshot(accountId?: string, authenticatedAccountId?: string) {
  const resolvedAccountId = authenticatedAccountId || await resolveCrmMcpAccountId(accountId);
  const store = await getStore(resolvedAccountId || undefined);
  return {
    accountId: resolvedAccountId || null,
    store,
  };
}

function asString(value: unknown) {
  return String(value || "").trim();
}

function asOptionalString(value: unknown) {
  const next = asString(value);
  return next || undefined;
}

function asOptionalNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return String(error || "unknown error");
}

function requiredString(value: unknown, field: string, maxLength = 5000) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${field} is too long`);
  return normalized;
}

function optionalField(value: unknown, field: string, maxLength = 5000) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > maxLength) throw new Error(`${field} must be a string of at most ${maxLength} characters`);
  return value.trim();
}

function dateCutoff(value: unknown) {
  if (value === undefined) return undefined;
  const cutoff = requiredString(value, "lastActivityBefore", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff) || Number.isNaN(Date.parse(`${cutoff}T00:00:00Z`))) {
    throw new Error("lastActivityBefore must be a valid YYYY-MM-DD date");
  }
  return cutoff;
}

function normalizeLinkedin(value: string) {
  return value.trim().replace(/\/$/, "").toLowerCase();
}

function assertNoDuplicateLead(
  contacts: Array<{ id: string; email?: string; linkedin?: string; firstName?: string; lastName?: string; company?: string }>,
  candidate: { id?: string; email?: string; linkedin?: string; firstName?: string; lastName?: string; company?: string }
) {
  const email = String(candidate.email || "").trim().toLowerCase();
  const linkedin = normalizeLinkedin(String(candidate.linkedin || ""));
  const name = `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim().toLowerCase();
  const company = String(candidate.company || "").trim().toLowerCase();
  const match = contacts.find((contact) => contact.id !== candidate.id && (
    (email && String(contact.email || "").trim().toLowerCase() === email) ||
    (linkedin && normalizeLinkedin(String(contact.linkedin || "")) === linkedin) ||
    (name && company && `${contact.firstName || ""} ${contact.lastName || ""}`.trim().toLowerCase() === name && String(contact.company || "").trim().toLowerCase() === company)
  ));
  if (match) throw new Error(`Possible duplicate lead: ${match.id}`);
}

function assertAllowedKeys(args: Record<string, unknown>, allowed: readonly string[]) {
  const extra = Object.keys(args).filter((key) => !allowed.includes(key));
  if (extra.length) throw new Error(`Unsupported argument: ${extra[0]}`);
}

function latestRecordedActivityLine(
  activities: Array<{ occurredAt?: string; type?: string; contactName?: string }>
) {
  const latest = activities.find((activity) => String(activity.occurredAt || "").trim());
  if (!latest?.occurredAt) return null;
  const when = latest.occurredAt;
  const type = String(latest.type || "activity");
  const contact = String(latest.contactName || "").trim();
  return `Latest recorded activity: ${when} (${type}${contact ? ` with ${contact}` : ""})`;
}

async function runTool(name: string, args: Record<string, unknown>, authenticatedAccountId?: string) {
  const { accountId, store } = await loadSnapshot(asOptionalString(args.accountId), authenticatedAccountId);

  switch (name) {
    case "find_outbound_leads": {
      assertAllowedKeys(args, ["query", "limit"]);
      const query = requiredString(args.query, "query", 200).toLowerCase();
      const limit = args.limit === undefined ? 20 : Number(args.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new Error("limit must be an integer from 1 to 50");
      const leads = store.contacts
        .filter((contact) => contact.pipelineType === "icp")
        .filter((contact) => [contact.firstName, contact.lastName, contact.company, contact.email, contact.linkedin, `${contact.firstName || ""} ${contact.lastName || ""}`].some((value) => String(value || "").toLowerCase().includes(query)))
        .slice(0, limit)
        .map((contact) => ({
          id: contact.id, firstName: contact.firstName || "", lastName: contact.lastName || "",
          company: contact.company || "", email: contact.email || "", linkedin: contact.linkedin || "",
          status: contact.status || "", doNotContact: contact.doNotContact === true,
        }));
      return formatToolResult("Matching Outbound Leads", { accountId, leads }, [`Returned ${leads.length} matches. Check do-not-contact before outreach.`]);
    }
    case "select_outbound_leads": {
      assertAllowedKeys(args, ["status", "liAccepted", "lastActivityBefore", "limit"]);
      const status = optionalField(args.status, "status", 40);
      if (status && !["New", "Attempting", "Connected", "Nurture"].includes(status)) throw new Error("Invalid status");
      if (args.liAccepted !== undefined && typeof args.liAccepted !== "boolean") throw new Error("liAccepted must be boolean");
      const before = dateCutoff(args.lastActivityBefore);
      const limit = args.limit === undefined ? 25 : Number(args.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("limit must be an integer from 1 to 100");
      const leads = store.contacts
        .filter((contact) => contact.pipelineType === "icp" && contact.doNotContact !== true)
        .filter((contact) => !status || contact.status === status)
        .filter((contact) => args.liAccepted === undefined || contact.liAccepted === args.liAccepted)
        .map((contact) => {
          const latest = store.activities
            .filter((activity) => activity.contactId === contact.id)
            .reduce((current, activity) => String(activity.occurredAt || "") > current ? String(activity.occurredAt) : current, "");
          return { contact, lastActivityDate: latest || contact.lastActivityDate || null };
        })
        .filter((entry) => !before || !entry.lastActivityDate || entry.lastActivityDate.slice(0, 10) < before)
        .sort((a, b) => String(a.lastActivityDate || "").localeCompare(String(b.lastActivityDate || "")))
        .slice(0, limit)
        .map(({ contact, lastActivityDate }) => ({
          id: contact.id, name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
          company: contact.company || "", title: contact.title || "", status: contact.status || "",
          email: contact.email || "", linkedin: contact.linkedin || "",
          liAccepted: contact.liAccepted === true, lastActivityDate, doNotContact: false,
        }));
      return formatToolResult("Eligible Outbound Leads", { accountId, leads }, [`Returned ${leads.length} eligible leads.`]);
    }
    case "create_outbound_lead": {
      assertAllowedKeys(args, ["firstName", "lastName", "company", "title", "email", "linkedin", "notes", "liAccepted", "doNotContact"]);
      const firstName = optionalField(args.firstName, "firstName", 120) || "";
      const lastName = optionalField(args.lastName, "lastName", 120) || "";
      if (!firstName && !lastName) throw new Error("firstName or lastName is required");
      if (args.liAccepted !== undefined && typeof args.liAccepted !== "boolean") throw new Error("liAccepted must be boolean");
      if (args.doNotContact !== undefined && typeof args.doNotContact !== "boolean") throw new Error("doNotContact must be boolean");
      const company = optionalField(args.company, "company", 200) || "";
      const email = (optionalField(args.email, "email", 320) || "").toLowerCase();
      const linkedin = optionalField(args.linkedin, "linkedin", 500) || "";
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
      assertNoDuplicateLead(store.contacts, { firstName, lastName, company, email, linkedin });
      const createdAt = now();
      const lead = {
        id: id(), firstName, lastName, company, email, linkedin,
        title: optionalField(args.title, "title", 200) || "",
        notes: optionalField(args.notes, "notes", 10000) || "",
        liAccepted: args.liAccepted === true, doNotContact: args.doNotContact === true,
        pipelineType: "icp" as const, leadSource: "Outbound" as const,
        status: "New", createdAt, updatedAt: createdAt,
      };
      store.contacts.unshift(lead);
      recordLeadStage(store, null, lead);
      await saveStore(store, accountId || undefined);
      return formatToolResult("Created Outbound Lead", { accountId, lead }, [`Created lead ${lead.id}.`]);
    }
    case "update_outbound_lead": {
      assertAllowedKeys(args, ["contactId", "firstName", "lastName", "company", "title", "email", "linkedin", "notes", "status", "liAccepted", "doNotContact"]);
      const contactId = requiredString(args.contactId, "contactId", 100);
      const index = store.contacts.findIndex((contact) => contact.id === contactId && contact.pipelineType === "icp");
      if (index < 0) throw new Error("ICP lead not found");
      const previous = store.contacts[index];
      if (previous.doNotContact === true && args.doNotContact === false) throw new Error("Do-not-contact cannot be cleared through MCP");
      if (args.doNotContact !== undefined && typeof args.doNotContact !== "boolean") throw new Error("doNotContact must be boolean");
      if (args.liAccepted !== undefined && typeof args.liAccepted !== "boolean") throw new Error("liAccepted must be boolean");
      const updates: Record<string, string | boolean> = {};
      for (const field of ["firstName", "lastName", "company", "title", "email", "linkedin", "notes", "status"] as const) {
        const max = field === "notes" ? 10000 : field === "email" || field === "linkedin" ? 500 : 200;
        const value = optionalField(args[field], field, max);
        if (value !== undefined) updates[field] = field === "email" ? value.toLowerCase() : value;
      }
      if (args.liAccepted !== undefined) updates.liAccepted = args.liAccepted;
      if (args.doNotContact !== undefined) updates.doNotContact = args.doNotContact;
      const updated = { ...previous, ...updates, updatedAt: now() };
      if (!String(updated.firstName || "").trim() && !String(updated.lastName || "").trim()) throw new Error("firstName or lastName is required");
      if (args.status !== undefined && !["New", "Attempting", "Connected"].includes(String(args.status))) throw new Error("This MCP tool supports only New, Attempting, and Connected stage updates");
      if (updated.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email)) throw new Error("Invalid email");
      if (["Connected", "Warm intro booked"].includes(String(updated.status)) && !updated.email) throw new Error("Email is required for this stage");
      assertNoDuplicateLead(store.contacts, updated);
      store.contacts[index] = updated;
      recordLeadStage(store, previous, updated);
      await saveStore(store, accountId || undefined);
      return formatToolResult("Updated Outbound Lead", { accountId, lead: updated }, [`Updated lead ${updated.id}.`]);
    }
    case "prepare_outreach_draft": {
      assertAllowedKeys(args, ["contactId"]);
      const contactId = requiredString(args.contactId, "contactId", 100);
      const contact = store.contacts.find((entry) => entry.id === contactId && entry.pipelineType === "icp");
      if (!contact) throw new Error("ICP lead not found");
      if (contact.doNotContact === true) throw new Error("Lead is marked do not contact");
      const brief = buildContactBrief(store, contactId);
      return formatToolResult("Outreach Draft Context", { accountId, brief, sent: false }, [
        `Lead: ${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
        `LinkedIn accepted: ${contact.liAccepted === true ? "Yes" : "No"}`,
        `Draft status: unsent. Review actual message thread and current role before sending.`,
      ]);
    }
    case "log_sent_outreach": {
      assertAllowedKeys(args, ["contactId", "channel", "message", "externalMessageId", "occurredAt"]);
      const contactId = requiredString(args.contactId, "contactId", 100);
      const channel = requiredString(args.channel, "channel", 20);
      if (!["linkedin", "email", "text"].includes(channel)) throw new Error("Invalid channel");
      const message = requiredString(args.message, "message", 10000);
      const externalMessageId = requiredString(args.externalMessageId, "externalMessageId", 1000);
      const contactIndex = store.contacts.findIndex((entry) => entry.id === contactId && entry.pipelineType === "icp");
      if (contactIndex < 0) throw new Error("ICP lead not found");
      const contact = store.contacts[contactIndex];
      if (contact.doNotContact === true) throw new Error("Lead is marked do not contact");
      if (channel === "linkedin" && contact.liAccepted !== true) throw new Error("LinkedIn connection is not marked accepted");
      if (channel === "email" && !contact.email) throw new Error("Lead has no email address");
      const duplicate = store.activities.find((activity) => activity.externalMessageId === externalMessageId);
      if (duplicate) return formatToolResult("Sent Outreach Already Logged", { accountId, activity: duplicate, duplicate: true }, [`Activity ${duplicate.id} already records this external message.`]);
      const occurredAt = args.occurredAt === undefined ? now() : requiredString(args.occurredAt, "occurredAt", 40);
      if (Number.isNaN(Date.parse(occurredAt))) throw new Error("occurredAt must be an ISO timestamp");
      const recordedAt = now();
      const activity = { id: id(), contactId, type: channel as "linkedin" | "email" | "text", note: message, externalMessageId, occurredAt, createdAt: recordedAt, updatedAt: recordedAt };
      store.activities.unshift(activity);
      const updated = { ...contact, status: advanceContactToAttemptingOnActivity(contact), lastActivityDate: occurredAt, lastActivityType: channel, updatedAt: recordedAt };
      store.contacts[contactIndex] = updated;
      recordLeadStage(store, contact, updated);
      await saveStore(store, accountId || undefined);
      return formatToolResult("Logged Sent Outreach", { accountId, activity, duplicate: false }, [`Logged verified ${channel} message for lead ${contactId}.`]);
    }
    case "get_daily_digest": {
      const digest = buildDailyDigest(store, asOptionalString(args.date));
      return formatToolResult("Daily CRM Digest", { accountId, ...digest }, [
        `Window: ${digest.window.label}`,
        `Activities: ${digest.summary.activityCount}`,
        `Contacts touched: ${digest.summary.contactsTouched}`,
        `New contacts: ${digest.summary.newContacts}`,
        `Won deals: ${digest.summary.wonDeals}`,
        `Due today: ${digest.summary.dueToday}`,
        `Overdue tasks: ${digest.summary.overdueTasks}`,
        `Coach mood: ${digest.summary.coachMood}`,
        `Focus: ${digest.focusItems.join(" | ")}`,
      ]);
    }
    case "get_activity_summary": {
      const summary = buildActivitySummary(store, asOptionalString(args.window));
      const lines = [
        `Window: ${summary.window.label}`,
        `Activity count: ${summary.totals.activityCount}`,
        `Contacts touched: ${summary.totals.contactsTouched}`,
        `Meetings: ${summary.totals.meetingCount}`,
        `Task completions: ${summary.totals.followThroughCount}`,
      ];
      if (summary.totals.activityCount === 0) {
        const latestLine = latestRecordedActivityLine(listRecentActivities(store, { limit: 1 }));
        if (latestLine) lines.push(latestLine);
        lines.push("No activity entries fall inside the requested time window.");
      }
      return formatToolResult("CRM Activity Summary", { accountId, ...summary }, lines);
    }
    case "get_pipeline_health": {
      const health = buildPipelineHealth(store, asOptionalString(args.window));
      return formatToolResult("CRM Pipeline Health", { accountId, ...health }, [
        `Window: ${health.window.label}`,
        `Open deals: ${health.counts.openDeals}`,
        `Won deals: ${health.counts.wonDeals}`,
        `Stale deals: ${health.counts.staleDeals}`,
        `Overdue tasks: ${health.counts.overdueTasks}`,
        `Activity pace: ${health.aheadBehind.activities}`,
        `Pipeline pace: ${health.aheadBehind.pipeline}`,
        `Deal pace: ${health.aheadBehind.deals}`,
      ]);
    }
    case "list_recent_activities": {
      const activities = listRecentActivities(store, {
        limit: asOptionalNumber(args.limit),
        contactId: asOptionalString(args.contactId),
        type: asOptionalString(args.type),
      });
      return formatToolResult("Recent CRM Activities", { accountId, activities }, [
        `Returned ${activities.length} activities.`,
      ]);
    }
    case "list_due_or_overdue_tasks": {
      const tasks = listDueOrOverdueTasks(store, asOptionalNumber(args.limit));
      return formatToolResult("Due Or Overdue CRM Tasks", { accountId, tasks }, [
        `Returned ${tasks.length} due or overdue tasks.`,
      ]);
    }
    case "get_contact_brief": {
      const contactId = asString(args.contactId);
      const brief = buildContactBrief(store, contactId);
      if (!brief) {
        return {
          content: [{ type: "text", text: `Contact ${contactId} was not found.` }],
          structuredContent: { accountId, contactId, found: false },
          isError: true,
        };
      }
      return formatToolResult("CRM Contact Brief", { accountId, ...brief }, [
        `Contact: ${brief.contact.name}`,
        `Company: ${brief.contact.company || "n/a"}`,
        `Status: ${brief.contact.status || "n/a"}`,
        `Do not contact: ${brief.contact.doNotContact ? "YES - never automate outreach" : "No"}`,
        `Recent activities: ${brief.activities.length}`,
        `Open tasks: ${brief.tasks.filter((task) => !task.done).length}`,
        `Linked deals: ${brief.deals.length}`,
      ]);
    }
    case "get_deal_brief": {
      const dealId = asString(args.dealId);
      const brief = buildDealBrief(store, dealId);
      if (!brief) {
        return {
          content: [{ type: "text", text: `Deal ${dealId} was not found.` }],
          structuredContent: { accountId, dealId, found: false },
          isError: true,
        };
      }
      return formatToolResult("CRM Deal Brief", { accountId, ...brief }, [
        `Deal: ${brief.deal.name}`,
        `Stage: ${brief.deal.stage}`,
        `Value: ${brief.deal.value}`,
        `Next step: ${brief.deal.nextStep || "n/a"}`,
        `Open tasks: ${brief.tasks.filter((task) => !task.done).length}`,
        `Recent contact activities: ${brief.recentContactActivities.length}`,
      ]);
    }
    case "compare_actuals_to_targets": {
      const comparison = compareActualsToTargets(store);
      return formatToolResult("CRM Actuals vs Targets", { accountId, ...comparison }, [
        `Revenue goal: ${comparison.targets.revenueGoalAnnual}`,
        `Target launches: ${comparison.funnelRequirements.targetLaunches}`,
        `Actual launches: ${comparison.currentState.actualLaunches}`,
        `Required warm intros: ${comparison.funnelRequirements.requiredWarmIntros}`,
        `Actual warm intros: ${comparison.currentState.actualWarmIntros}`,
        `Required active leads: ${comparison.funnelRequirements.requiredLeads}`,
        `Actual active leads: ${comparison.currentState.actualLeads}`,
      ]);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function isNotification(message: JsonRpcRequest) {
  return message.id === undefined || message.id === null || String(message.method || "").startsWith("notifications/");
}

async function handleMessage(
  message: JsonRpcRequest,
  principal: Awaited<ReturnType<typeof resolveCrmMcpPrincipal>>,
  challenge: string
) {
  if (!message || message.jsonrpc !== "2.0" || !message.method) {
    return jsonRpcError(message?.id, -32600, "Invalid JSON-RPC request", { status: 400 });
  }

  if (isNotification(message)) return accepted();

  if (message.method === "initialize") {
    return jsonRpcResult(message.id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      serverInfo: SERVER_INFO,
      instructions:
        "Glyph CRM is the source of truth. Select eligible leads, check do-not-contact status and history, and prepare drafts before outreach. Write tools can create or update leads and log outreach only after a message is verified as sent in its destination. The server does not send messages.",
    });
  }

  if (message.method === "tools/list") {
    return jsonRpcResult(message.id, {
      tools: TOOLS.map((tool) => ({
        ...tool,
        annotations: "annotations" in tool ? tool.annotations : { readOnlyHint: true, destructiveHint: false },
        ...(oauthEnabled() && principal?.source !== "key" ? { securitySchemes: [{ type: "oauth2", scopes: WRITE_TOOLS.has(tool.name) ? ["crm:write"] : ["crm:read"] }] } : {}),
      })),
    });
  }

  if (message.method === "tools/call") {
    const toolName = asString(message.params?.name);
    if (!toolName) return jsonRpcError(message.id, -32602, "Tool name is required", { status: 400 });
    const tool = TOOLS.find((entry) => entry.name === toolName);
    if (!tool) return jsonRpcError(message.id, -32601, `Tool not found: ${toolName}`, { status: 404 });
    if (!principal && oauthEnabled()) {
      return jsonRpcResult(message.id, {
        content: [{ type: "text", text: "Connect your CRM account to use this tool." }],
        _meta: { "mcp/www_authenticate": [challenge] },
        isError: true,
      });
    }
    if (!principal) return jsonRpcError(message.id, -32001, "Unauthorized", { status: 401 });
    if (WRITE_TOOLS.has(toolName) && principal.access !== "write") {
      return jsonRpcResult(message.id, {
        content: [{ type: "text", text: "A separate CRM MCP write credential is required for this tool." }],
        ...(principal.source === "oauth" ? { _meta: { "mcp/www_authenticate": [challenge.replace("invalid_token", "insufficient_scope")] } } : {}),
        isError: true,
      });
    }

    try {
      const rawArgs = message.params?.arguments;
      const args = rawArgs && typeof rawArgs === "object" && !Array.isArray(rawArgs)
        ? (rawArgs as Record<string, unknown>)
        : {};
      const result = await runTool(toolName, args, principal.accountId);
      return jsonRpcResult(message.id, result);
    } catch (error: unknown) {
      return jsonRpcResult(message.id, {
        content: [
          {
            type: "text",
            text: `Tool execution failed: ${errorMessage(error)}`,
          },
        ],
        structuredContent: {
          tool: toolName,
          error: errorMessage(error),
        },
        isError: true,
      });
    }
  }

  return jsonRpcError(message.id, -32601, `Method not found: ${message.method}`, { status: 404 });
}

export async function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: {
      Allow: "POST",
    },
  });
}

export async function DELETE() {
  return new NextResponse(null, {
    status: 405,
    headers: {
      Allow: "POST",
    },
  });
}

export async function POST(req: Request) {
  if (!isAllowedCrmMcpOrigin(req)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }
  const principal = await resolveCrmMcpPrincipal(req);
  const challenge = oauthChallenge(req.url);
  if (!principal && !oauthEnabled()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (Array.isArray(payload)) {
    if (!payload.length) return NextResponse.json({ error: "Empty batch" }, { status: 400 });
    const messages = payload as JsonRpcRequest[];
    const nonNotifications = messages.filter((message) => !isNotification(message));
    if (!nonNotifications.length) return accepted();
    const responses = await Promise.all(nonNotifications.map((message) => handleMessage(message, principal, challenge).then((response) => response.json())));
    return NextResponse.json(responses);
  }

  return handleMessage(payload as JsonRpcRequest, principal, challenge);
}
