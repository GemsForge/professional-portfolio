/**
 * Cloudflare Access identity bridge for self-hosting on Cloudflare Workers.
 *
 * The owner-only code (media, knowledge and admin pages) was written for
 * ChatGPT Sites, which injects trusted `oai-authenticated-user-*` headers.
 * When the site runs on its own Cloudflare account, nothing upstream strips or
 * sets those headers, so this module:
 *
 * 1. Always removes any incoming `oai-authenticated-user-*` headers, so a
 *    visitor can never spoof the owner identity.
 * 2. Verifies the Cloudflare Access JWT (header `Cf-Access-Jwt-Assertion` or
 *    cookie `CF_Authorization`) against the team's signing keys, the expected
 *    audience (AUD) and expiry.
 * 3. When valid, re-adds `oai-authenticated-user-id`/`-email` from the token,
 *    so the existing owner checks keep working unchanged.
 *
 * Required environment variables (non-secret, set in the Worker config):
 * - `ACCESS_TEAM_DOMAIN`: e.g. `https://gemsforge.cloudflareaccess.com`
 * - `ACCESS_AUD`: the Access application's Audience tag.
 */

const OAI_PREFIX = "oai-authenticated-user-";
const KEY_CACHE_MS = 60 * 60 * 1000;

type AccessEnv = { ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string };
type Jwk = JsonWebKey & { kid?: string };
type AccessClaims = { aud?: string | string[]; email?: string; sub?: string; exp?: number; nbf?: number; iss?: string };

let keyCache: { domain: string; fetchedAt: number; keys: Map<string, CryptoKey> } | null = null;

/** Base64url to bytes. */
function b64url(input: string): Uint8Array<ArrayBuffer> {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Loads (and caches for an hour) the team's RS256 public signing keys. */
async function signingKeys(domain: string, forceRefresh = false): Promise<Map<string, CryptoKey>> {
  if (!forceRefresh && keyCache && keyCache.domain === domain && Date.now() - keyCache.fetchedAt < KEY_CACHE_MS) {
    return keyCache.keys;
  }
  const res = await fetch(`${domain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs request failed: ${res.status}`);
  const { keys = [] } = (await res.json()) as { keys?: Jwk[] };
  const map = new Map<string, CryptoKey>();
  for (const jwk of keys) {
    if (!jwk.kid) continue;
    map.set(jwk.kid, await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]));
  }
  keyCache = { domain, fetchedAt: Date.now(), keys: map };
  return map;
}

/** Reads the Access token from the forwarded header or the Access cookie. */
function readToken(request: Request): string | null {
  const header = request.headers.get("cf-access-jwt-assertion");
  if (header) return header;
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Verifies an Access JWT and returns its claims, or null when it is missing,
 * malformed, expired, signed by an unknown key, or for another audience.
 */
export async function verifyAccessToken(token: string, env: AccessEnv): Promise<AccessClaims | null> {
  const domain = env.ACCESS_TEAM_DOMAIN?.replace(/\/+$/, "");
  const aud = env.ACCESS_AUD;
  if (!domain || !aud) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let header: { alg?: string; kid?: string };
  let claims: AccessClaims;
  try {
    header = JSON.parse(new TextDecoder().decode(b64url(parts[0])));
    claims = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;

  let keys = await signingKeys(domain);
  if (!keys.has(header.kid)) keys = await signingKeys(domain, true); // key rotation
  const key = keys.get(header.kid);
  if (!key) return null;

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) return null;

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(aud)) return null;
  if (claims.iss && claims.iss.replace(/\/+$/, "") !== domain) return null;
  if (!claims.exp || claims.exp < now) return null;
  if (claims.nbf && claims.nbf > now + 60) return null;
  if (!claims.email || !claims.sub) return null;
  return claims;
}

/**
 * Returns a copy of the request with spoofable identity headers removed and,
 * when a valid Access token is present, trusted identity headers added.
 */
export async function withAccessIdentity(request: Request, env: AccessEnv): Promise<Request> {
  const headers = new Headers(request.headers);
  for (const name of [...headers.keys()]) {
    if (name.toLowerCase().startsWith(OAI_PREFIX)) headers.delete(name);
  }
  const token = readToken(request);
  if (token) {
    try {
      const claims = await verifyAccessToken(token, env);
      if (claims) {
        headers.set("oai-authenticated-user-id", claims.sub!);
        headers.set("oai-authenticated-user-email", claims.email!.toLowerCase());
      }
    } catch {
      // Treat verification failures as signed out; never as signed in.
    }
  }
  return new Request(request, { headers });
}

/**
 * Maps the ChatGPT Sites sign-in and sign-out paths to Cloudflare Access.
 * Sign-in sends the owner to the protected page (Access prompts there);
 * sign-out ends the Access session. Returns null for other paths.
 */
export function accessAuthRedirect(url: URL): Response | null {
  if (url.pathname === "/signin-with-chatgpt") {
    const target = url.searchParams.get("return_to") || "/admin/";
    const safe = target.startsWith("/") && !target.startsWith("//") ? target : "/admin/";
    return Response.redirect(new URL(safe, url).toString(), 302);
  }
  if (url.pathname === "/signout-with-chatgpt") {
    return Response.redirect(new URL("/cdn-cgi/access/logout", url).toString(), 302);
  }
  return null;
}
