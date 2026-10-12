import type { Hackathon } from "@/data/content";

// Ridge drawing space. The SVG is stretched (preserveAspectRatio="none") to the container,
// and the HTML marker buttons are positioned with the same percentages, so they always line up.
export const W = 1200;
export const H = 400;

type Pt = { x: number; y: number };

const r1 = (n: number) => Math.round(n * 10) / 10;
const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${r1(p.x)} ${r1(p.y)}`).join(" ");

// Summit height in drawing units (lower y = higher peak), derived from position and result:
// the line climbs over time, and wins stand taller than the events the team competed in.
function peakYFor(i: number, n: number, result: Hackathon["result"]) {
  const base = 190 - (n > 1 ? i / (n - 1) : 0) * 100;
  return result === "win" ? base - 20 : base + 20;
}

export type RidgeMarker = {
  id: string;
  index: number;
  result: Hackathon["result"];
  /** where the marker stands */
  x: number;
  y: number;
  /** the summit above it (same as x/y for wins) */
  peakX: number;
  peakY: number;
  /** dashed unclimbed route (participations only) */
  route?: string;
};

export function buildRidge(items: Hackathon[]) {
  const n = items.length;
  const left = 100;
  const step = (W - left * 2) / Math.max(1, n - 1);

  const pts: Pt[] = [{ x: 0, y: 300 }, { x: 40, y: 286 }];
  const markers: RidgeMarker[] = [];

  items.forEach((h, i) => {
    const x = left + i * step;
    const peakY = peakYFor(i, n, h.result);
    // jagged shoulders, deterministic per index so server and client agree
    const jag = ((i * 37) % 11) - 5;
    const shoulderL: Pt = { x: x - step * 0.3, y: peakY + 62 + jag };
    const notchL: Pt = { x: x - step * 0.14, y: peakY + 30 - jag };
    const shoulderR: Pt = { x: x + step * 0.22, y: peakY + 74 - jag };
    pts.push(shoulderL, notchL, { x, y: peakY }, { x: x + step * 0.08, y: peakY + 18 }, shoulderR);
    if (i < n - 1) pts.push({ x: x + step * 0.5, y: 262 + ((i * 53) % 29) });

    if (h.result === "win") {
      markers.push({ id: h.id, index: i, result: h.result, x, y: peakY, peakX: x, peakY });
    } else {
      // base marker partway up the left face; the unclimbed route continues to the summit
      const t = 0.55;
      const mx = shoulderL.x + (notchL.x - shoulderL.x) * t;
      const my = shoulderL.y + (notchL.y - shoulderL.y) * t;
      markers.push({
        id: h.id,
        index: i,
        result: h.result,
        x: mx,
        y: my,
        peakX: x,
        peakY,
        route: toPath([{ x: mx, y: my }, notchL, { x, y: peakY }]),
      });
    }
  });

  pts.push({ x: W - 40, y: 280 }, { x: W, y: 296 });

  const line = toPath(pts);
  const fill = `${line} L${W} ${H} L0 ${H} Z`;
  return { line, fill, markers };
}

/** Far ridges: layered sine noise, sampled coarsely for a hand-cut silhouette. */
export function backRidge(base: number, amp: number, seed: number) {
  const pts: Pt[] = [];
  for (let x = 0; x <= W; x += 30) {
    const y =
      base +
      Math.sin(x * 0.006 + seed) * amp +
      Math.sin(x * 0.017 + seed * 2.3) * amp * 0.45 +
      Math.sin(x * 0.041 + seed * 0.7) * amp * 0.18;
    pts.push({ x, y });
  }
  const line = toPath(pts);
  return { line, fill: `${line} L${W} ${H} L0 ${H} Z` };
}

export const pct = (v: number, of: number) => `${(v / of) * 100}%`;
