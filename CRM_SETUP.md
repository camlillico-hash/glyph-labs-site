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

## Storage

If `DATABASE_URL` is set, CRM data is stored in Postgres.
If not set, it falls back to `data/crm.json` (local dev only).


Guest mode is read-only. Any POST/PUT/DELETE on /api/crm/* is blocked for guest sessions.
