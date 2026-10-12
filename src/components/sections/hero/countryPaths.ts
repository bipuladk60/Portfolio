// Builds SVG path data for the USA and Nepal outlines (Natural Earth 1:50m) in the hero map's
// equirectangular projection. Imported by the server Hero only, so the raw coordinate file never
// ships in the client bundle; the client receives the finished path strings as props.

import { nepalOutline, usaOutline, type Ring } from "@/data/countries";
import { project } from "./geo";

export type BBox = [number, number, number, number]; // minX, minY, maxX, maxY in map units

/** Projects rings to a path, dropping points closer than `minStep` map units to the last kept one. */
function toPath(rings: Ring[], minStep: number, digits: number) {
  return rings
    .map((ring) => {
      const out: string[] = [];
      let lx = Infinity;
      let ly = Infinity;
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        const last = i === ring.length - 1;
        if (!last && i > 0 && Math.hypot(x - lx, y - ly) < minStep) return;
        out.push(`${out.length ? "L" : "M"}${x.toFixed(digits)} ${y.toFixed(digits)}`);
        lx = x;
        ly = y;
      });
      return out.length > 2 ? `${out.join("")}Z` : "";
    })
    .join("");
}

function bbox(rings: Ring[]): BBox {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      const [x, y] = project(lon, lat);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return [minX, minY, maxX, maxY];
}

// Contiguous USA = the ring with the most points; used to frame the "USA" quick-fly.
const mainland = usaOutline.reduce((a, b) => (b.length > a.length ? b : a), usaOutline[0]);

export const USA_PATH = toPath(usaOutline, 0.12, 1);
export const NEPAL_PATH = toPath(nepalOutline, 0, 2);
export const USA_BBOX = bbox([mainland]);
export const NEPAL_BBOX = bbox(nepalOutline);
