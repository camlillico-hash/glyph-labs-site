import { NextResponse } from "next/server";
import { buildActivitySummary, buildContactBrief, buildDailyDigest, buildDealBrief, buildPipelineHealth, compareActualsToTargets, listDueOrOverdueTasks, listRecentActivities } from "@/lib/crm-analytics";
import { getStore } from "@/lib/crm-store";
import { isAllowedCrmMcpOrigin, isAuthorizedCrmMcpRequest, resolveCrmMcpAccountId } from "@/lib/crm-mcp-auth";

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
        accountId: { type: "string" },
      },
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

async function loadSnapshot(accountId?: string) {
  const resolvedAccountId = await resolveCrmMcpAccountId(accountId);
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

async function runTool(name: string, args: Record<string, unknown>) {
  const { accountId, store } = await loadSnapshot(asOptionalString(args.accountId));

  switch (name) {
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
        const latestLine = latestRecordedActivityLine(summary.recentActivities || []);
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

async function handleMessage(message: JsonRpcRequest) {
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
        "Use this server for CRM digests, pipeline health, contact briefs, deal briefs, and target comparisons. CRM is the source of truth and this server is read-only.",
    });
  }

  if (message.method === "tools/list") {
    return jsonRpcResult(message.id, {
      tools: TOOLS,
    });
  }

  if (message.method === "tools/call") {
    const toolName = asString(message.params?.name);
    if (!toolName) return jsonRpcError(message.id, -32602, "Tool name is required", { status: 400 });
    const tool = TOOLS.find((entry) => entry.name === toolName);
    if (!tool) return jsonRpcError(message.id, -32601, `Tool not found: ${toolName}`, { status: 404 });

    try {
      const rawArgs = message.params?.arguments;
      const args = rawArgs && typeof rawArgs === "object" && !Array.isArray(rawArgs)
        ? (rawArgs as Record<string, unknown>)
        : {};
      const result = await runTool(toolName, args);
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
  if (!isAuthorizedCrmMcpRequest(req)) {
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
    const responses = await Promise.all(nonNotifications.map((message) => handleMessage(message).then((response) => response.json())));
    return NextResponse.json(responses);
  }

  return handleMessage(payload as JsonRpcRequest);
}
