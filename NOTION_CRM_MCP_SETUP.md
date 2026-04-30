# Notion CRM MCP Setup

This app now exposes a read-only CRM MCP server for Notion Custom Agents.

## Endpoint

- MCP: `POST /api/crm/mcp`
- Health: `GET /api/crm/mcp/health`

## Required env vars

- `CRM_MCP_API_KEY`

## Optional env vars

- `CRM_MCP_ACCOUNT_ID`
- `CRM_MCP_ALLOW_ACCOUNT_OVERRIDE=1`
- `CRM_MCP_ALLOWED_ORIGINS`

## Recommended Notion Custom Agent setup

1. Create or open a Notion Custom Agent.
2. In `Tools & Access`, add a custom MCP server.
3. Use the deployed MCP URL:
   - `https://<your-domain>/api/crm/mcp`
4. Configure header auth with:
   - `Authorization: Bearer <CRM_MCP_API_KEY>`
5. Keep the toolset read-only in v1.

## Suggested agent instructions

Use this as the agent's instructions or system prompt:

```text
You are a CRM briefing assistant for Glyph Labs.

Use the CRM MCP tools as the source of truth for sales activity, pipeline health, tasks, contacts, deals, and target comparisons.

Default behavior:
- Start with get_daily_digest for daily briefing requests.
- Use get_pipeline_health when the user asks where they are ahead or behind.
- Use list_due_or_overdue_tasks for follow-up triage.
- Use get_contact_brief and get_deal_brief before giving recommendations about a specific person or deal.
- Use compare_actuals_to_targets when the user asks about progress against revenue or conversion goals.

Rules:
- Treat the CRM as canonical.
- Do not invent metrics that are not returned by the tools.
- When something looks behind, explain the concrete reason using the returned counts or gaps.
- Keep responses concise and operational.
```

## Recommended first workflows

Use these first inside Notion after the MCP server is connected:

1. `Give me my CRM daily brief for today.`
2. `Where am I behind this week in CRM, and what should I do first?`
3. `List overdue follow-up tasks and the deals most at risk.`
4. `Compare current CRM funnel state to targets.`
5. `Brief me on BOS360 CRM activity before today's meetings.`

## Exposed tools

- `get_daily_digest`
- `get_activity_summary`
- `get_pipeline_health`
- `list_recent_activities`
- `list_due_or_overdue_tasks`
- `get_contact_brief`
- `get_deal_brief`
- `compare_actuals_to_targets`

## Notes

- The CRM remains the source of truth.
- The MCP server uses service auth, not CRM browser cookies.
- If `CRM_MCP_ACCOUNT_ID` is omitted, the server picks the most populated account first, then the oldest account as fallback.
