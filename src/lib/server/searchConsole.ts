// Server-only. The `server-only` package is not installed, so the guard is structural: this module (and
// serviceAccountJwt.ts, which imports node:crypto) is imported only from server components. Importing it from a
// "use client" file would fail the build on node:crypto.
import { games } from "@/data/content";
import { GOOGLE_TOKEN_URL, normalisePrivateKey, signServiceAccountJwt } from "./serviceAccountJwt";

const S = games[0].search;

/** Search Console property. Warmer is a Domain property. Override with GSC_SITE_URL. */
const DEFAULT_SITE_URL = "sc-domain:warmergames.com";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TIMEOUT_MS = 5000;

/** One day of homepage web-search performance. `date` is YYYY-MM-DD (Search Console uses Pacific time). */
export type SearchDay = { date: string; clicks: number; impressions: number };

/** Plain, serialisable shape handed from the server to WarmerStats. */
export type WarmerSearchLive = {
  clicks: number;
  impressions: number;
  /** 0..1 */
  ctr: number;
  /** impression-weighted mean of the daily average positions */
  position: number;
  daily: SearchDay[];
  startDate: string;
  /** last date Search Console has data for */
  dataThrough: string;
  /** ISO timestamp of the fetch */
  fetchedAt: string;
};

type Row = { keys?: string[]; clicks?: number; impressions?: number; position?: number };

const pacificToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const assertion = signServiceAccountJwt({ clientEmail, privateKey, scope: SCOPE });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("token missing");
  return json.access_token;
}

/** Throws on any failure; the public wrapper turns that into null. */
async function fetchLive(siteUrl: string): Promise<WarmerSearchLive> {
  const clientEmail = process.env.GSC_CLIENT_EMAIL?.trim();
  const rawKey = process.env.GSC_PRIVATE_KEY;
  if (!clientEmail || !rawKey) throw new Error("missing credentials");
  const token = await getAccessToken(clientEmail, normalisePrivateKey(rawKey));
  const endDate = pacificToday();
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        startDate: S.launchDate,
        endDate,
        dimensions: ["date"],
        type: "web",
        // include fresh (not yet final) data, like the Search Console UI does by default
        dataState: "all",
        dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "equals", expression: S.scopePage }] }],
        rowLimit: 1000,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new Error(`query ${res.status}`);
  const json = (await res.json()) as { rows?: Row[] };
  const rows = (json.rows ?? []).filter((r) => r.keys?.[0]);
  if (rows.length === 0) throw new Error("no rows");

  const byDate = new Map(rows.map((r) => [r.keys![0], r]));
  const dataThrough = rows.map((r) => r.keys![0]).sort().at(-1)!;

  // dense daily series: Search Console omits days with no impressions
  const daily: SearchDay[] = [];
  for (let t = Date.parse(`${S.launchDate}T00:00:00Z`); t <= Date.parse(`${dataThrough}T00:00:00Z`); t += 86400000) {
    const date = new Date(t).toISOString().slice(0, 10);
    const r = byDate.get(date);
    daily.push({ date, clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0 });
  }

  let clicks = 0;
  let impressions = 0;
  let weighted = 0;
  for (const r of rows) {
    clicks += r.clicks ?? 0;
    impressions += r.impressions ?? 0;
    weighted += (r.position ?? 0) * (r.impressions ?? 0);
  }
  if (impressions === 0) throw new Error("no impressions");

  return {
    clicks,
    impressions,
    ctr: clicks / impressions,
    position: weighted / impressions,
    daily,
    startDate: S.launchDate,
    dataThrough,
    fetchedAt: new Date().toISOString(),
  };
}

// The site is a static export, so this runs at build time (a scheduled rebuild keeps it fresh). In `next dev` the
// page renders per request, so successful results are memoised in-process to avoid calling Google on every reload.
const DEV_MEMO_MS = 6 * 60 * 60 * 1000;
let memo: { at: number; siteUrl: string; value: WarmerSearchLive } | null = null;

/**
 * Live homepage web-search totals for warmergames.com since launch, or null when credentials are missing or
 * anything fails. Never throws and never logs credentials.
 */
export async function getWarmerSearchLive(): Promise<WarmerSearchLive | null> {
  if (!process.env.GSC_CLIENT_EMAIL?.trim() || !process.env.GSC_PRIVATE_KEY) return null;
  const siteUrl = process.env.GSC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  try {
    if (memo && memo.siteUrl === siteUrl && Date.now() - memo.at < DEV_MEMO_MS) return memo.value;
    const value = await fetchLive(siteUrl);
    memo = { at: Date.now(), siteUrl, value };
    return value;
  } catch (err) {
    // message only: never the key, the token or the request
    console.warn(`[search-console] live data unavailable, using the content.ts snapshot (${err instanceof Error ? err.message : "error"})`);
    return null;
  }
}
