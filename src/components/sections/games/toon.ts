// The Game Room borrows Warmer's own cartoon identity: day sky, ink outlines, sticker cards,
// and the game's heat colours (yellow = far, red = close, green = found).

export const INK = "#1d2340";
export const SKY_TOP = "#bfe5ff";
export const SKY_BOTTOM = "#e9f7ff";
export const YELLOW = "#ffd23f";
export const ORANGE = "#ff9f1c";
export const RED = "#ef3b2c";
export const GREEN = "#2ed3a0";
export const PAPER = "#ffffff";

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const Y = hex(YELLOW);
const O = hex(ORANGE);
const R = hex(RED);

/**
 * t = distance / half the Earth's circumference (0..1). 0 is the answer (green).
 * Close guesses run red, far ones settle at yellow, like the real game.
 */
export function toonHeat(t: number, found = false): string {
  if (found) return GREEN;
  const s = Math.max(0, Math.min(1, t / 0.5));
  const [a, b, k] = s < 0.5 ? [R, O, s / 0.5] : [O, Y, (s - 0.5) / 0.5];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function heatWord(t: number, found = false) {
  if (found) return "Got it";
  if (t < 0.1) return "Hot";
  if (t < 0.22) return "Warm";
  if (t < 0.42) return "Cool";
  return "Cold";
}

/** Scoped styles for the Game Room world (prefix wr-). */
export const WARMER_CSS = `
.wr-world { color: ${INK}; font-family: var(--font-nunito), system-ui, sans-serif; }
.wr-display { font-family: var(--font-fredoka), var(--font-nunito), system-ui, sans-serif; }
.wr-sticker {
  position: relative;
  background: ${PAPER};
  border: 3px solid ${INK};
  border-radius: 24px;
  box-shadow: 6px 6px 0 ${INK};
}
.wr-pill {
  border: 2.5px solid ${INK};
  border-radius: 999px;
  box-shadow: 3px 3px 0 ${INK};
}
.wr-press { transition: transform 120ms ease, box-shadow 120ms ease, background-color 200ms ease; }
.wr-press:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 ${INK}; }
.wr-press:active { transform: translate(4px, 4px); box-shadow: 0 0 0 ${INK}; }
.wr-world :focus-visible { outline: 3px solid ${INK}; outline-offset: 3px; }
.wr-wobble:hover { animation: wr-wobble 0.7s ease-in-out; }
@keyframes wr-wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-1.2deg); }
  50% { transform: rotate(1deg); }
  75% { transform: rotate(-0.5deg); }
}
.wr-drift { animation: wr-drift linear infinite alternate; }
@keyframes wr-drift { from { transform: translateX(-24px); } to { transform: translateX(24px); } }
.wr-paused .wr-drift { animation-play-state: paused; }
`;
