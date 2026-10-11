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
