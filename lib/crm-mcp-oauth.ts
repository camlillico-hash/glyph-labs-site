import crypto from "node:crypto";
import { getCrmMcpAccess } from "@/lib/crm-mcp-auth";
import { getUserAccountIds, getUserByEmail } from "@/lib/crm-auth-store";

type Principal = { access: "read" | "write"; accountId?: string; source: "key" | "oauth" };
type Claims = Record<string, unknown>;
type JsonWebKeyWithKid = JsonWebKey & { kid?: string; use?: string; alg?: string; kty?: string };

function issuer() {
  return String(process.env.CRM_MCP_OAUTH_ISSUER || "").trim();
}

export function oauthEnabled() {
  return Boolean(issuer() && process.env.CRM_MCP_OAUTH_AUDIENCE);
}

export function oauthResource() {
  return String(process.env.CRM_MCP_OAUTH_AUDIENCE || "").trim();
}

export function oauthResourceMetadataUrl() {
  return new URL("/.well-known/oauth-protected-resource", oauthResource()).toString();
}

export function oauthResourceMetadata() {
  if (!oauthEnabled()) return null;
  return {
    resource: oauthResource(),
    authorization_servers: [issuer()],
    scopes_supported: ["crm:read", "crm:write"],
  };
}

function decodePart(part: string): Claims {
  const value = JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid JWT payload");
  return value as Claims;
}

async function verifyAccessToken(token: string): Promise<Claims | null> {
  if (!oauthEnabled()) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) return null;
  let header: Claims;
  let claims: Claims;
  try {
    header = decodePart(parts[0]);
    claims = decodePart(parts[1]);
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || typeof header.kid !== "string") return null;
  const expectedIssuer = issuer();
  const audience = String(process.env.CRM_MCP_OAUTH_AUDIENCE);
  if (claims.iss !== expectedIssuer) return null;
  if (claims.aud !== audience && !(Array.isArray(claims.aud) && claims.aud.includes(audience))) return null;
  const current = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || claims.exp <= current) return null;
  if (typeof claims.nbf === "number" && claims.nbf > current) return null;
  if (typeof claims.iat === "number" && claims.iat > current + 60) return null;
  try {
    const jwksUrl = String(process.env.CRM_MCP_OAUTH_JWKS_URL || `${expectedIssuer.replace(/\/$/, "")}/.well-known/jwks.json`);
    const response = await fetch(jwksUrl, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = await response.json() as { keys?: JsonWebKeyWithKid[] };
    const jwk = data.keys?.find((key) => key.kid === header.kid && key.kty === "RSA" && (!key.use || key.use === "sig") && (!key.alg || key.alg === "RS256"));
    if (!jwk) return null;
    const key = crypto.createPublicKey({ key: jwk as crypto.JsonWebKey, format: "jwk" });
    const signed = `${parts[0]}.${parts[1]}`;
    if (!crypto.verify("RSA-SHA256", Buffer.from(signed), key, Buffer.from(parts[2], "base64url"))) return null;
  } catch {
    return null;
  }
  return claims;
}

export async function resolveCrmMcpPrincipal(req: Request): Promise<Principal | null> {
  const keyAccess = getCrmMcpAccess(req);
  if (keyAccess) return { access: keyAccess, source: "key" };
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  const claims = await verifyAccessToken(authorization.slice(7).trim());
  if (!claims) return null;

  const claimName = String(process.env.CRM_MCP_OAUTH_EMAIL_CLAIM || "email");
  const verifiedClaimName = String(process.env.CRM_MCP_OAUTH_EMAIL_VERIFIED_CLAIM || "email_verified");
  const email = String(claims[claimName] || "").trim().toLowerCase();
  if (!email || claims[verifiedClaimName] !== true) return null;
  const user = await getUserByEmail(email).catch(() => null);
  if (!user) return null;
  const memberships = await getUserAccountIds(user.id).catch(() => []);
  if (memberships.length !== 1) return null;
  const membership = memberships[0];
  const scopes = String(claims.scope || "").split(/\s+/);
  if (!scopes.includes("crm:read") && !scopes.includes("crm:write")) return null;
  const canWrite = scopes.includes("crm:write") && ["owner", "admin"].includes(membership.role);
  return { access: canWrite ? "write" : "read", accountId: membership.account_id, source: "oauth" };
}

export function oauthChallenge() {
  return `Bearer resource_metadata="${oauthResourceMetadataUrl()}", error="invalid_token", error_description="Connect your CRM account to continue"`;
}
