"use client";

import type { Hackathon } from "@/data/content";

/** One row in the plain list under the ridge: event name and Win / Competed. Same selection as the ridge markers. */
export function Patch({
  h,
  active,
  dim,
  onSelect,
}: {
  h: Hackathon;
  active: boolean;
  dim: boolean;
  onSelect: () => void;
}) {
  const isWin = h.result === "win";
  const color = isWin ? "var(--signal)" : "var(--sky)";

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`${h.event}: ${isWin ? `win, ${h.award}` : "competed"}. Show details.`}
        className="group flex w-full cursor-pointer items-start gap-2.5 border-t py-3 text-left transition-[opacity,border-color] duration-300"
        style={{ opacity: dim ? 0.35 : 1, borderColor: active ? color : "var(--line)" }}
      >
        <span
          aria-hidden
          className={`mt-[7px] inline-block h-1.5 w-1.5 shrink-0 ${isWin ? "rounded-full" : "rotate-45"}`}
          style={{ background: color }}
        />
        <span className="min-w-0">
          <span className={`block text-sm leading-snug transition-colors ${active ? "text-text" : "text-text/75 group-hover:text-text"}`}>
            {h.event}
          </span>
          <span className="mt-0.5 block font-mono text-[11px] tracking-[0.06em]" style={{ color }}>
            {isWin ? "Win" : "Competed"}
          </span>
        </span>
      </button>
    </li>
  );
}
