import type { CSSProperties, ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  label?: string;
  accent?: string; // any CSS colour, defaults to the hairline colour
  className?: string;
  as?: "div" | "article" | "li" | "section";
  style?: CSSProperties;
};

/**
 * The basic HUD container: hairline border, corner brackets, optional mono label tab.
 * Accent colour drives the brackets and label so each section can carry its flag colour.
 */
export function Panel({ children, label, accent = "var(--line-hi)", className = "", as = "div", style }: PanelProps) {
  const Tag = as;
  return (
    <Tag
      data-cursor-box=""
      className={`relative border border-line bg-panel/80 ${className}`}
      style={{ ["--accent" as string]: accent, ...style }}
    >
      <Brackets />
      {label && (
        <span className="hud-label absolute -top-[9px] left-4 bg-bg px-2" style={{ color: accent }}>
          {label}
        </span>
      )}
      {children}
    </Tag>
  );
}

export function Brackets({ size = 10 }: { size?: number }) {
  const s = `${size}px`;
  const common = "pointer-events-none absolute border-[var(--accent)]";
  return (
    <span aria-hidden>
      <span className={`${common} -left-px -top-px border-l-2 border-t-2`} style={{ width: s, height: s }} />
      <span className={`${common} -right-px -top-px border-r-2 border-t-2`} style={{ width: s, height: s }} />
      <span className={`${common} -bottom-px -left-px border-b-2 border-l-2`} style={{ width: s, height: s }} />
      <span className={`${common} -bottom-px -right-px border-b-2 border-r-2`} style={{ width: s, height: s }} />
    </span>
  );
}

export function Chip({ children, color = "var(--text-dim)" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center border px-2 py-0.5 font-mono text-[11px] tracking-wide"
      style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)`, color }}
    >
      {children}
    </span>
  );
}
