import { INK } from "@/components/toon/toon";
import { r1 } from "../shared/prng";

// Cartoon bunting in the five prayer-flag colours (blue, white, red, green, yellow, repeating),
// strung across the contact card with ink outlines. Each pennant sways from the string.
const FLAG_COLORS = ["#4c8dff", "#ffffff", "#ef3b2c", "#2ed3a0", "#ffd23f"];

const P0 = { x: 0, y: 8 };
const P1 = { x: 600, y: 52 };
const P2 = { x: 1200, y: 8 };
const bez = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
});

const COUNT = 20;
const FLAGS = Array.from({ length: COUNT }, (_, i) => {
  const p = bez((i + 0.5) / COUNT);
  return { x: r1(p.x), y: r1(p.y) };
});

export function FlagLine() {
  return (
    <svg aria-hidden viewBox="0 0 1200 96" className="block h-auto w-full" overflow="visible">
      <path d={`M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {FLAGS.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y - 2})`}>
          <path
            className="up-flag"
            d="M-22 0 L22 0 L0 38 Z"
            fill={FLAG_COLORS[i % 5]}
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
            style={{ animationDelay: `${r1(-i * 0.21)}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

export const UPLINK_CSS = `
.up-flag { transform-box: fill-box; transform-origin: 50% 0; animation: up-sway 2.8s ease-in-out infinite; }
@keyframes up-sway {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-7deg); }
  70% { transform: rotate(6deg); }
}
.wr-paused .up-flag { animation-play-state: paused; }
`;
