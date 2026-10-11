"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { mulberry32, r1 } from "./prng";

/**
 * Peepal leaf, hanging from its petiole at (0,0): heart-shaped blade with the long "drip tip".
 * Drawn pointing down so rotation 0 is a leaf hanging straight.
 */
const LEAF =
  "M0 0 L0 4 C-5 0.5 -12.5 4 -12 12 C-11.5 18 -5 21.5 -1.2 26 L0 38 L1.2 26 C5 21.5 11.5 18 12 12 C12.5 4 5 0.5 0 4 Z";

const TONES = ["#26381e", "#344b26", "#43602f", "#57713a"];

type Cluster = { cx: number; cy: number; rx: number; ry: number; n: number; ox: number; oy: number; back?: boolean };

// Canopy clusters at the branch tips. ox/oy is the sway pivot (where the cluster's branch leaves the trunk).
const CLUSTERS: Cluster[] = [
  { cx: 200, cy: 150, rx: 92, ry: 34, n: 16, ox: 200, oy: 230, back: true },
  { cx: 92, cy: 168, rx: 58, ry: 36, n: 15, ox: 150, oy: 206 },
  { cx: 160, cy: 104, rx: 60, ry: 38, n: 16, ox: 190, oy: 180 },
  { cx: 244, cy: 96, rx: 62, ry: 38, n: 16, ox: 205, oy: 180 },
  { cx: 312, cy: 156, rx: 56, ry: 36, n: 15, ox: 256, oy: 196 },
];

type Leaf = { x: number; y: number; rot: number; s: number; tone: string; flutter: boolean; delay: number; rim: boolean };

const LEAVES: Leaf[][] = CLUSTERS.map((c, ci) => {
  const rng = mulberry32(101 + ci * 17);
  return Array.from({ length: c.n }, (_, i) => {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng());
    return {
      x: r1(c.cx + Math.cos(a) * c.rx * d),
      y: r1(c.cy + Math.sin(a) * c.ry * d),
      rot: r1((rng() - 0.5) * 120),
      s: r1(0.72 + rng() * 0.42),
      tone: c.back ? TONES[Math.floor(rng() * 2)] : TONES[Math.floor(rng() * TONES.length)],
      flutter: i % 2 === 0,
      delay: r1(rng() * -3.2),
      rim: !c.back && rng() > 0.62,
    };
  });
});

const FALLING = [
  { left: "30%", top: "22%", dur: 13, delay: 0, s: 0.9 },
  { left: "62%", top: "16%", dur: 15.5, delay: 4.5, s: 0.75 },
  { left: "78%", top: "30%", dur: 11.5, delay: 8, s: 0.85 },
  { left: "18%", top: "34%", dur: 14, delay: 11, s: 0.7 },
];

export function PeepalTree() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const reduce = useReducedMotion();

  return (
    <div
      ref={ref}
      aria-hidden
      className="ch-scene relative mx-auto w-full max-w-[460px]"
      data-paused={!inView || reduce ? "true" : "false"}
    >
      <svg viewBox="0 0 400 420" className="block h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="chautari-trunk" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#1e120d" />
            <stop offset="0.6" stopColor="#3b2419" />
            <stop offset="1" stopColor="#7a4a2c" />
          </linearGradient>
          <pattern id="chautari-brick" width="24" height="12" patternUnits="userSpaceOnUse">
            <rect width="24" height="12" fill="#6e3a26" />
            <path d="M0 0.5H24M0 6.5H24M12 0.5V6.5M0.5 6.5V12M23.5 6.5V12" stroke="#38190f" strokeWidth="1" fill="none" />
          </pattern>
          <linearGradient id="chautari-face-shade" x1="0" x2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.45" />
            <stop offset="0.7" stopColor="#000" stopOpacity="0.05" />
            <stop offset="1" stopColor="#ff9a3c" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="200" cy="414" rx="190" ry="8" fill="#000" opacity="0.35" />

        {/* chautari: stepped brick platform */}
        <rect x="30" y="402" width="340" height="12" fill="#4a2618" />
        <path d="M30 402 H370" stroke="#ff9a3c" strokeOpacity="0.25" />
        <rect x="46" y="354" width="308" height="48" fill="url(#chautari-brick)" />
        <rect x="46" y="354" width="308" height="48" fill="url(#chautari-face-shade)" />
        <polygon points="66,336 334,336 354,354 46,354" fill="#8b5a3c" />
        <polygon points="66,336 334,336 354,354 46,354" fill="url(#chautari-face-shade)" opacity="0.6" />
        <path d="M46 354 H354" stroke="#ffb46b" strokeOpacity="0.45" />

        {/* trunk with flared roots */}
        <path
          d="M168 346 C178 318 184 292 182 262 C180 240 168 222 146 208 L156 199 C176 210 188 222 195 236 C197 214 195 196 188 176 L201 172 C208 192 210 212 208 232 C216 214 232 201 254 190 L261 200 C238 212 222 230 216 258 C214 292 220 318 232 346 C220 340 210 342 200 346 C190 342 178 342 168 346 Z"
          fill="url(#chautari-trunk)"
        />
        <path d="M168 346 C160 344 150 346 140 346 L172 336 Z M232 346 C242 344 252 346 262 346 L228 336 Z" fill="#2b1a12" />
        {/* branches */}
        <g stroke="url(#chautari-trunk)" strokeLinecap="round" fill="none">
          <path d="M150 204 C128 190 110 182 92 170" strokeWidth="6" />
          <path d="M192 178 C186 150 176 128 160 108" strokeWidth="5" />
          <path d="M202 176 C212 146 226 122 244 100" strokeWidth="5" />
          <path d="M256 194 C276 180 292 170 312 158" strokeWidth="5" />
          <path d="M120 186 C112 200 104 206 94 212" strokeWidth="3" />
          <path d="M290 172 C300 184 310 190 322 196" strokeWidth="3" />
        </g>

        {/* canopy */}
        {CLUSTERS.map((c, ci) => (
          <g
            key={ci}
            className="ch-sway"
            style={{
              transformOrigin: `${c.ox}px ${c.oy}px`,
              animationDuration: `${6 + ci * 0.9}s`,
              animationDelay: `${-ci * 1.3}s`,
            }}
            opacity={c.back ? 0.8 : 1}
          >
            {LEAVES[ci].map((l, li) => (
              <g key={li} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}>
                <g className={l.flutter ? "ch-flutter" : undefined} style={l.flutter ? { animationDelay: `${l.delay}s` } : undefined}>
                  <path d={LEAF} fill={l.tone} stroke={l.rim ? "#ff9a3c" : "#1a2614"} strokeOpacity={l.rim ? 0.55 : 0.6} strokeWidth="0.8" />
                  <path d="M0 4 L0 30" stroke="#1a2614" strokeOpacity="0.55" strokeWidth="0.7" />
                </g>
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* a few leaves drifting down */}
      {!reduce &&
        FALLING.map((f, i) => (
          <svg
            key={i}
            viewBox="-14 -2 28 42"
            className="ch-fall pointer-events-none absolute w-4"
            style={{ left: f.left, top: f.top, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, scale: f.s }}
          >
            <path d={LEAF} fill={i % 2 ? "#6b7a34" : "#8a7a2e"} />
          </svg>
        ))}
    </div>
  );
}

export const CHAUTARI_CSS = `
.ch-scene[data-paused="true"] *, .ch-scene[data-paused="true"] { animation-play-state: paused !important; }
.ch-sway { transform-box: view-box; animation: ch-sway 7s ease-in-out infinite alternate; }
@keyframes ch-sway { from { transform: rotate(-1.2deg); } to { transform: rotate(1.2deg); } }
.ch-flutter { transform-box: fill-box; transform-origin: 50% 0; animation: ch-flutter 3.4s ease-in-out infinite alternate; }
@keyframes ch-flutter { from { transform: rotate(-8deg); } to { transform: rotate(7deg); } }
.ch-fall { opacity: 0; animation: ch-fall 13s linear infinite; }
@keyframes ch-fall {
  0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
  8% { opacity: 0.9; }
  45% { transform: translate3d(-30px, 120px, 0) rotate(140deg); }
  85% { opacity: 0.6; }
  100% { opacity: 0; transform: translate3d(16px, 270px, 0) rotate(320deg); }
}
.ch-die-face { backface-visibility: visible; }
`;
