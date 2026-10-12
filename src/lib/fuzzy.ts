// Subsequence fuzzy matcher with bonuses for consecutive runs and word starts.
// Returns null when the query is not a subsequence of the text.

export type FuzzyResult = { score: number; indices: number[] };

export function fuzzyMatch(query: string, text: string): FuzzyResult | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const t = text.toLowerCase();
  const indices: number[] = [];
  let score = 0;
  let ti = 0;
  let prev = -2;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    if (ch === " ") continue;
    const found = t.indexOf(ch, ti);
    if (found === -1) return null;
    const boundary = found === 0 || /[\s:/\-·.]/.test(t[found - 1]);
    score += 1;
    if (found === prev + 1) score += 3;
    if (boundary) score += 2;
    score -= Math.min(3, (found - ti) * 0.1);
    indices.push(found);
    prev = found;
    ti = found + 1;
  }
  if (t.startsWith(q)) score += 6;
  return { score, indices };
}

const BOUNDARY = /[\s:/\-·.]/;

/**
 * Stricter label match for the palette: the first query character must land on a word start
 * and the match may not sprawl (span bounded relative to query length).
 */
export function strictLabelMatch(query: string, text: string): FuzzyResult | null {
  const m = fuzzyMatch(query, text);
  const q = query.replace(/\s+/g, "");
  if (!m || !q) return m;
  const first = m.indices[0];
  if (first > 0 && !BOUNDARY.test(text[first - 1])) return null;
  const span = m.indices[m.indices.length - 1] - first + 1;
  if (span > q.length * 3 + 6) return null;
  return m;
}

/** Every query token must be a prefix of some word in the haystack. */
export function tokenPrefixMatch(query: string, haystack: string): number | null {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0;
  const words = haystack.toLowerCase().split(/[\s:/\-·.]+/).filter(Boolean);
  let score = 0;
  for (const t of tokens) {
    const hit = words.find((w) => w.startsWith(t));
    if (!hit) return null;
    score += t.length + (hit === t ? 2 : 0);
  }
  return score;
}
