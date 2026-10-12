// Decorative string of prayer flags used as a top border for the contact console.
// Order: blue, white, red, green, yellow, repeating.
const FLAG_COLORS = ["#4C8DFF", "#EDEDE6", "#FF5C5C", "#34C98A", "#F2B418"];

const r1 = (v: number) => Math.round(v * 10) / 10;

// A gentle sag across the width.
const P0 = { x: 0, y: 6 };
const P1 = { x: 600, y: 34 };
const P2 = { x: 1200, y: 6 };
const bez = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
});

const COUNT = 30;
const FLAGS = Array.from({ length: COUNT }, (_, i) => {
  const p = bez((i + 0.5) / COUNT);
  return { x: r1(p.x), y: r1(p.y) };
});

export function FlagLine() {
  return (
    <svg aria-hidden viewBox="0 0 1200 56" preserveAspectRatio="none" className="block h-8 w-full md:h-10">
      <path d={`M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`} fill="none" stroke="#8A97A6" strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke" />
      {FLAGS.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          <rect className="up-flag" x="-12" y="0" width="24" height="20" fill={FLAG_COLORS[i % 5]} opacity="0.85" style={{ animationDelay: `${r1(-i * 0.16)}s` }} />
        </g>
      ))}
    </svg>
  );
}

export const UPLINK_CSS = `
.up-flag { transform-box: fill-box; transform-origin: 50% 0; animation: up-flutter 2.6s ease-in-out infinite; }
@keyframes up-flutter {
  0%, 100% { transform: skewX(0deg) scaleX(1); }
  25% { transform: skewX(-9deg) scaleX(0.94); }
  50% { transform: skewX(3deg) scaleX(0.98); }
  75% { transform: skewX(-5deg) scaleX(0.95); }
}
`;
