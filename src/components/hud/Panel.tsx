import type { CSSProperties, ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  label?: string;
  accent?: string; // any CSS colour, drives the label (and brackets when on)
  className?: string;
  as?: "div" | "article" | "li" | "section";
  style?: CSSProperties;
  /** Corner brackets are opt-in: the default panel is a single quiet hairline. */
  brackets?: boolean;
};

/**
 * The basic HUD container. Quiet by default: one faint hairline, no fill change, no brackets.
 * An optional label sits above the box as a plain small caption, not a tab cut into the border.
 * Panels do not opt into the cursor box-lock; only explicit top-level visuals do (data-cursor-box="lock").
 */
export function Panel({ children, label, accent = "var(--line-hi)", className = "", as = "div", style, brackets = false }: PanelProps) {
  const Tag = as;
  return (
    <Tag
      className={`relative border border-line/80 bg-panel/40 ${label ? "mt-7" : ""} ${className}`}
      style={{ ["--accent" as string]: accent, ...style }}
    >
      {brackets && <Brackets />}
      {label && (
        <span className="hud-label pointer-events-none absolute -top-6 left-0" style={{ color: accent }}>
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
