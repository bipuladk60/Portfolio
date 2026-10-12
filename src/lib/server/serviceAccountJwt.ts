import { createSign } from "node:crypto";

/**
 * Google service-account JWT (RS256) for the OAuth 2.0 JWT-bearer grant.
 * Server-only: it signs with the private key. Kept dependency-free (Node crypto only).
 */

export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

const b64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

export function signServiceAccountJwt({
  clientEmail,
  privateKey,
  scope,
  audience = GOOGLE_TOKEN_URL,
  now = Math.floor(Date.now() / 1000),
  lifetimeSeconds = 3600,
}: {
  clientEmail: string;
  privateKey: string;
  scope: string;
  audience?: string;
  now?: number;
  lifetimeSeconds?: number;
}): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: clientEmail, scope, aud: audience, iat: now, exp: now + lifetimeSeconds }),
  );
  const unsigned = `${header}.${claims}`;
  const signature = createSign("RSA-SHA256").update(unsigned).end().sign(privateKey).toString("base64url");
  return `${unsigned}.${signature}`;
}

/** Env PEMs usually carry literal "\n" escapes; turn them back into newlines. */
export const normalisePrivateKey = (raw: string) => raw.replace(/\\n/g, "\n").trim();
