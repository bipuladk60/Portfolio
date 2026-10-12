import type { CSSProperties, ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  /** Any CSS colour; tints the fill, hairline, corner ticks and hover glow. */
  accent?: string;
  /** Small L-shaped ticks in the accent colour at the four corners. */
  corners?: boolean;
  /** Hover / focus-within lift (3 px, none under reduced motion) with an accent glow. */
  lift?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "article" | "section" | "figure" | "li";
};

/**
 * Rev 7 container: one soft tinted surface (faint accent gradient, hairline, inner highlight).
 * Meant to be the ONLY level of containment around a group; never nest a Surface in a Surface.
 * Server-safe. Does not opt into the cursor box-lock (add data-cursor-box="lock" yourself on a
 * top-level visual only).
 */
export function Surface({
  children,
  accent = "var(--line-hi)",
  corners = false,
  lift = false,
  className = "",
  style,
  as = "div",
}: SurfaceProps) {
  const Tag = as;
  return (
    <Tag className={`surface ${lift ? "surface-lift" : ""} ${className}`} style={{ ["--accent" as string]: accent, ...style }}>
      {corners && <Ticks />}
      {children}
    </Tag>
  );
}

/** Corner ticks for a `.surface` (or any positioned box with --accent set). */
export function Ticks() {
  return (
    <span aria-hidden>
      <span className="surface-tick -left-px -top-px border-l border-t" />
      <span className="surface-tick -right-px -top-px border-r border-t" />
      <span className="surface-tick -bottom-px -left-px border-b border-l" />
      <span className="surface-tick -bottom-px -right-px border-b border-r" />
    </span>
  );
}

/**
 * Soft section-colour glow. Absolutely positioned and painted behind content (-z-10); place it
 * inside a `relative` parent and size/position it with className (e.g. "-left-20 -top-24 h-80 w-[36rem]").
 */
export function Glow({ color = "var(--signal)", strength = 16, className = "" }: { color?: string; strength?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute -z-10 ${className}`}
      style={{
        background: `radial-gradient(closest-side, color-mix(in oklab, ${color} ${strength}%, transparent), color-mix(in oklab, ${color} ${Math.round(strength / 3)}%, transparent) 55%, transparent)`,
      }}
    />
  );
}
