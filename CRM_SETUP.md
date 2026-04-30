# CRM Setup

## Required env vars

- `CRM_PASSWORD` - password for `/crm/login`
- `CRM_SESSION_SECRET` - random string for session cookie
- `CRM_GUEST_PASSWORD` - optional view-only guest password
- `DATABASE_URL` - hosted Postgres connection string (recommended/required in production)

## Optional Gmail read-only sync

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (example: `https://yourdomain.com/api/crm/gmail/callback`)

Use scope: `https://www.googleapis.com/auth/gmail.readonly`.

## Optional Notion Custom Agent MCP connection

- `CRM_MCP_API_KEY` - required bearer token or API key for the hosted CRM MCP endpoint
- `CRM_MCP_ACCOUNT_ID` - optional fixed CRM account ID for the MCP server to use
- `CRM_MCP_ALLOW_ACCOUNT_OVERRIDE=1` - optional; allows callers to pass `accountId` per tool call
- `CRM_MCP_ALLOWED_ORIGINS` - optional comma-separated origin allowlist for browser-based MCP clients

MCP endpoint:

- `POST /api/crm/mcp`

Health check:

- `GET /api/crm/mcp/health`

The MCP server is read-only in v1 and is intended for Notion Custom Agents using header-based authentication.

## Storage

If `DATABASE_URL` is set, CRM data is stored in Postgres.
If not set, it falls back to `data/crm.json` (local dev only).


Guest mode is read-only. Any POST/PUT/DELETE on /api/crm/* is blocked for guest sessions.
