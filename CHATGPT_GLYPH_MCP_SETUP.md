# Glyph CRM in ChatGPT Work and Codex

## Current implementation

The production endpoint is `https://camlillico.com/api/crm/mcp`.

The MCP exposes CRM briefings plus these outbound tools:

- `select_outbound_leads`: filters ICP leads and always excludes do-not-contact records.
- `find_outbound_leads`: searches existing leads before create or update, including do-not-contact status for identification.
- `create_outbound_lead`: creates a lead after duplicate checks.
- `update_outbound_lead`: updates selected fields; it cannot clear do-not-contact or trigger later-stage deal workflows.
- `prepare_outreach_draft`: supplies CRM context for a message drafted in ChatGPT Work. It does not save or send a draft.
- `log_sent_outreach`: records an actual LinkedIn, email, or text send with its external message ID or URL. It does not send the message. The caller must verify the send in the destination first.

The existing `CRM_MCP_API_KEY` remains read-only. `CRM_MCP_WRITE_API_KEY` is a separate, optional credential for write tools. Do not reuse the read key as the write key.

## OAuth prerequisite for ChatGPT Work

Auth0 tenant: `dev-km4cqryav3vbabe0.us.auth0.com`. The Glyph CRM MCP API has identifier `https://camlillico.com/api/crm/mcp`, RS256 signing, and `crm:read` / `crm:write` permissions. CIMD registration and Resource Parameter Compatibility Profile are enabled. The database connection is promoted to domain level with the user's approval. The Post Login Action `Glyph CRM MCP verified identity` is deployed and live in the login flow. A dedicated third-party Native application, `ChatGPT Work for Glyph CRM`, uses public-client PKCE, allows `https://chatgpt.com/connector_platform_oauth_redirect`, and has user-delegated access to both CRM scopes. Its client ID is `tpc_wnJQQTP3SA6xmQWwVGen1C`; no client secret is needed for the `none` token endpoint authentication method. The tenant currently has no users. Production protected-resource metadata is pending deployment of this branch.

Auth0's preview of importing `https://chatgpt.com/oauth/client.json` selects `private_key_jwt`. Auth0 documents that method for CIMD as Enterprise-only. Use the predefined public OAuth client above in ChatGPT Work's Advanced OAuth settings with token endpoint authentication method `none`.

ChatGPT Work cannot supply the existing shared API key as a custom plugin header. Configure an OAuth 2.1 provider before creating the personal plugin. The server accepts RS256 access tokens with:

- issuer exactly matching `CRM_MCP_OAUTH_ISSUER`;
- audience exactly matching `CRM_MCP_OAUTH_AUDIENCE`;
- a verified email claim that matches one CRM user with exactly one CRM account membership;
- `crm:read` for read tools and `crm:write` for write tools.

The provider must support MCP OAuth discovery and authorization code with PKCE S256. ChatGPT supports a predefined OAuth client as well as CIMD or DCR. It must pass the MCP `resource` parameter through authorization and token issuance. The CRM MCP server is the resource server; Auth0 issues and manages tokens.

Set these deployment environment variables:

```text
CRM_MCP_OAUTH_ISSUER=https://dev-km4cqryav3vbabe0.us.auth0.com/
CRM_MCP_OAUTH_AUDIENCE=https://camlillico.com/api/crm/mcp
CRM_MCP_OAUTH_EMAIL_CLAIM=https://camlillico.com/email
CRM_MCP_OAUTH_EMAIL_VERIFIED_CLAIM=https://camlillico.com/email_verified
```

Auth0 should add both namespaced claims to the access token in a Post Login Action; the verified claim must be the boolean `true`. The two claim-name variables are optional if a provider already includes standard `email` and `email_verified` fields. `CRM_MCP_OAUTH_JWKS_URL` is optional if the provider publishes keys somewhere other than `{issuer}/.well-known/jwks.json`. Do not put secrets in these files.

After deployment, check `https://camlillico.com/.well-known/oauth-protected-resource` and test OAuth with MCP Inspector before connecting ChatGPT. Create a personal plugin in ChatGPT developer mode using `https://camlillico.com/api/crm/mcp`, install it, and invoke it with `@Glyph CRM` in a Work chat. Refresh plugin metadata after tool changes.

## Sending workflow

LinkedIn and email sending require separate access to the destination. The current CRM Gmail integration is read-only, and the CRM has no LinkedIn send API. The Gmail plugin is already installed in this ChatGPT account. Use it for email if the relevant mailbox is connected. For LinkedIn, use an authenticated browser session. In ChatGPT Work, send through the destination, verify the sent item there, then call `log_sent_outreach` with the external message ID or URL. Never log a draft as sent. Review the real message thread and current role before sending. Do-not-contact is a hard stop.

Once the personal plugin and sending connections work in an ordinary Work chat, create a scheduled task with the desired filters, cadence, time zone, review rules, and sending permission. Review its first runs in Scheduled.

Example first run in Work:

```text
@Glyph CRM Select up to 10 ICP leads with LinkedIn accepted, stage Attempting, and last activity before [YYYY-MM-DD]. Exclude do-not-contact. For each, read the CRM brief and actual LinkedIn conversation, verify the current role, and prepare a short personal follow-up for my review. Do not send or log drafts. Show the lead ID, reason for selection, and draft.
```

When the first run is accurate, add a schedule and explicit sending rules. An email or LinkedIn send must be verified in that destination before its CRM activity is logged.

Example later run after the user authorizes sending:

```text
@Glyph CRM Select eligible ICP leads using my saved criteria. Recheck do-not-contact and the CRM history immediately before each send. For LinkedIn, inspect the actual conversation and current profile, send the approved message in LinkedIn, verify it appears in the thread, then log the exact text and sent-message URL. For email, use @Gmail to inspect the thread, send the approved email, verify it in Sent, then log the exact text and Gmail message ID. Skip uncertain matches and report them for review. Do not log drafts or failed sends.
```

## Codex local connection

The parent project has `.codex/config.toml` pointed at this MCP endpoint. Set `CRM_MCP_API_KEY` in the environment that starts Codex for read access, or change `bearer_token_env_var` to `CRM_MCP_WRITE_API_KEY` after provisioning a distinct write key. Start a new Codex task and verify a read-only call before any writes.
