/**
 * The one deliberate break in the HUD: the camp warms to dusk.
 * Translucent gradient (the terrain canvas behind main still shows through) into dusk, a horizon glow, a low sun and layered hills.
 * Purely decorative and static (server-rendered).
 */
export function DuskBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--dusk) 45%, transparent) 14%, color-mix(in oklab, var(--dusk) 78%, transparent) 38%, color-mix(in oklab, color-mix(in oklab, var(--dusk-glow) 22%, var(--dusk)) 80%, transparent) 62%, color-mix(in oklab, color-mix(in oklab, var(--dusk-glow) 34%, var(--dusk)) 82%, transparent) 70%, color-mix(in oklab, var(--dusk) 70%, transparent) 84%, transparent 100%)",
        }}
      />
      {/* horizon glow */}
      <div
        className="absolute inset-x-0 top-[52%] h-[30%]"
        style={{
          background:
            "radial-gradient(60% 70% at 70% 60%, color-mix(in oklab, var(--dusk-glow) 38%, transparent) 0%, transparent 70%)",
        }}
      />
      {/* low sun */}
      <div
        className="absolute left-[64%] top-[58%] aspect-square w-[min(34vw,300px)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, #ffd28a 0%, var(--dusk-glow) 28%, color-mix(in oklab, var(--dusk-glow) 30%, transparent) 46%, transparent 70%)",
          opacity: 0.55,
        }}
      />
      {/* hills, far to near */}
      <svg
        className="absolute inset-x-0 bottom-[10%] h-[30%] w-full opacity-80"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
      >
        <path
          d="M0 170 C120 120 220 140 330 110 C450 78 560 130 680 104 C800 78 900 60 1020 96 C1130 128 1240 90 1340 100 L1440 108 L1440 300 L0 300 Z"
          fill="#5a3426"
          opacity="0.55"
        />
        <path
          d="M0 210 C140 170 260 196 380 168 C520 136 600 186 740 166 C880 146 960 120 1100 150 C1220 176 1320 150 1440 158 L1440 300 L0 300 Z"
          fill="#3d2219"
          opacity="0.85"
        />
        <path
          d="M0 250 C160 226 300 246 460 228 C620 210 720 240 880 232 C1040 224 1160 204 1300 222 L1440 232 L1440 300 L0 300 Z"
          fill="#24140f"
        />
      </svg>
      {/* foot of the hills fades back into the HUD */}
      <div
        className="absolute inset-x-0 bottom-0 h-[14%]"
        style={{ background: "linear-gradient(to bottom, color-mix(in oklab, #24140f 80%, transparent), transparent)" }}
      />
    </div>
  );
}
