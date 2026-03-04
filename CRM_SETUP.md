# CRM Setup

## Required env vars

- `CRM_PASSWORD` - password for `/crm/login`
- `CRM_SESSION_SECRET` - random string for session cookie

## Optional Gmail read-only sync

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (example: `https://yourdomain.com/api/crm/gmail/callback`)

Use scope: `https://www.googleapis.com/auth/gmail.readonly`.

## Storage

CRM data is stored in `data/crm.json` (contacts, deals, tasks, gmail metadata).
