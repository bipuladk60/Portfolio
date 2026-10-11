import { campById, formatAltitude } from "@/data/camps";

// Lungta order: blue, white, red, green, yellow, repeating.
const FLAG_COLORS = ["#4C8DFF", "#EDEDE6", "#FF5C5C", "#34C98A", "#F2B418"];

const r1 = (v: number) => Math.round(v * 10) / 10;

// String sags as a quadratic curve from the left edge up to the summit cairn.
const P0 = { x: -20, y: 70 };
const P1 = { x: 330, y: 250 };
const P2 = { x: 640, y: 92 };
const bez = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
});

// Second string runs from the summit down the right ridge.
const Q0 = { x: 640, y: 92 };
const Q1 = { x: 930, y: 230 };
const Q2 = { x: 1220, y: 120 };
const bez2 = (t: number) => ({
  x: (1 - t) ** 2 * Q0.x + 2 * (1 - t) * t * Q1.x + t * t * Q2.x,
  y: (1 - t) ** 2 * Q0.y + 2 * (1 - t) * t * Q1.y + t * t * Q2.y,
});

const FLAGS_A = Array.from({ length: 20 }, (_, i) => {
  const p = bez(0.05 + (i / 20) * 0.9);
  return { x: r1(p.x), y: r1(p.y) };
});
const FLAGS_B = Array.from({ length: 18 }, (_, i) => {
  const p = bez2(0.06 + (i / 18) * 0.9);
  return { x: r1(p.x), y: r1(p.y) };
});
const FLAGS = [...FLAGS_A, ...FLAGS_B];

export function SummitScene() {
  const alt = formatAltitude(campById("uplink").altitude);
  return (
    <div className="relative -mx-5 overflow-hidden md:mx-0">
      <svg
        aria-hidden
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMax slice"
        className="block h-[260px] w-full sm:h-[320px] md:h-[400px]"
      >
        <defs>
          <linearGradient id="uplink-peak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a2430" />
            <stop offset="1" stopColor="#0d1218" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="uplink-snow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EDEDE6" stopOpacity="0.5" />
            <stop offset="1" stopColor="#EDEDE6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* far ranges */}
        <path d="M0 330 L140 250 L230 290 L360 200 L470 270 L560 230 L700 300 L820 220 L960 280 L1080 210 L1200 260 L1200 420 L0 420 Z" fill="#2E4052" opacity="0.18" />
        <path d="M0 360 L120 300 L260 340 L400 280 L520 330 L640 300 L780 350 L900 290 L1040 330 L1200 300 L1200 420 L0 420 Z" fill="#2E4052" opacity="0.28" />

        {/* main peak */}
        <path
          d="M0 420 L180 330 L300 300 L420 220 L520 170 L600 110 L640 92 L690 130 L760 160 L840 230 L930 260 L1040 320 L1200 360 L1200 420 Z"
          fill="url(#uplink-peak)"
          stroke="#2E4052"
          strokeWidth="1.2"
        />
        {/* sunlit snow faces */}
        <path d="M640 92 L690 130 L760 160 L720 190 L680 170 L660 140 Z" fill="url(#uplink-snow)" />
        <path d="M640 92 L600 110 L585 140 L612 128 Z" fill="#EDEDE6" opacity="0.18" />
        {/* contour hairlines */}
        <g fill="none" stroke="#2E4052" strokeWidth="0.6" opacity="0.7">
          <path d="M470 240 C540 200 600 170 640 160 C700 168 760 200 820 250" />
          <path d="M380 290 C470 250 560 220 640 210 C740 220 830 260 900 300" />
        </g>

        {/* prayer-flag strings */}
        <path d={`M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`} fill="none" stroke="#8A97A6" strokeWidth="0.8" opacity="0.7" />
        <path d={`M${Q0.x} ${Q0.y} Q${Q1.x} ${Q1.y} ${Q2.x} ${Q2.y}`} fill="none" stroke="#8A97A6" strokeWidth="0.8" opacity="0.7" />
        {FLAGS.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y})`}>
            <g className="up-flag" style={{ animationDelay: `${r1(-i * 0.16)}s` }}>
              <rect x="-12" y="0" width="24" height="30" fill={FLAG_COLORS[i % 5]} opacity="0.88" />
              <path d="M-7 9H7M-7 14H7M-7 19H5" stroke="#0A0D12" strokeOpacity="0.25" strokeWidth="1" />
            </g>
          </g>
        ))}

        {/* summit cairn + marker */}
        <path d="M640 92 V58" stroke="#EDEDE6" strokeWidth="1.4" />
        <path d="M640 58 L662 64 L640 70 Z" fill="#EDEDE6" />
        <circle cx="640" cy="92" r="3" fill="#EDEDE6" />
        <circle cx="640" cy="92" r="9" fill="none" stroke="#EDEDE6" strokeOpacity="0.5" className="up-ping" />
      </svg>

      <div className="pointer-events-none absolute inset-x-5 top-4 md:inset-x-0 md:top-6">
        <p className="hud-label text-air">Expedition complete</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display text-3xl font-bold uppercase leading-none tracking-tight text-air sm:text-4xl md:text-6xl">
          <span>Summit reached</span>
          <span className="text-dim">·</span>
          <span>{alt}</span>
        </p>
      </div>
    </div>
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
.up-ping { transform-box: fill-box; transform-origin: center; animation: up-ping 2.4s ease-out infinite; }
@keyframes up-ping { from { transform: scale(0.6); opacity: 0.9; } to { transform: scale(2.4); opacity: 0; } }
`;
