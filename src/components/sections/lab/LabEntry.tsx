import type { ReactNode } from "react";
import { Brackets } from "@/components/hud/Panel";

type LabEntryProps = {
  /** Figure number, shared by the entry and its instrument ("01"). */
  n: string;
  /** Small mono line above the title: an award, a date. */
  meta: ReactNode;
  title: string;
  /** Text column body: pitch, bullets, question... */
  children: ReactNode;
  stack?: string[];
  link?: { label: string; href: string };
  figure: { label: string; status: string; node: ReactNode };
};

/**
 * One Research & ML entry. All three entries share this exact layout, so the section reads as one
 * lab bench: text on the left, a framed instrument on the right with the same header strip and brackets.
 */
export function LabEntry({ n, meta, title, children, stack, link, figure }: LabEntryProps) {
  return (
    <article className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-5">
        <p className="hud-label flex items-center gap-3">
          <span className="text-water">{n}</span>
          <span aria-hidden className="h-px w-6 bg-water/60" />
          <span>{meta}</span>
        </p>
        <h3 className="mt-3 font-display text-3xl font-semibold uppercase leading-[0.95] tracking-tight text-text sm:text-[2.1rem]">
          {title}
        </h3>
        <div className="mt-4 text-base leading-relaxed text-text/90">{children}</div>
        {(stack || link) && (
          <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-line pt-4">
            {stack && <p className="font-mono text-[11px] text-dim">{stack.join(" · ")}</p>}
            {link && (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-sky underline-offset-4 hover:underline"
              >
                {link.label} ↗
              </a>
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 lg:col-span-7">
        <Instrument n={n} label={figure.label} status={figure.status}>
          {figure.node}
        </Instrument>
      </div>
    </article>
  );
}

/** The framed figure: hairline box, corner brackets, a header strip with figure number and a live status. */
export function Instrument({ n, label, status, children }: { n: string; label: string; status: string; children: ReactNode }) {
  return (
    <figure
      data-cursor-box="lock"
      className="relative border border-line bg-panel/35"
      style={{ ["--accent" as string]: "var(--water)" }}
    >
      <Brackets size={9} />
      <figcaption className="hud-label flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <span className="truncate">
          <span className="text-water">Fig. {n}</span> · {label}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span aria-hidden className="led h-1.5 w-1.5 rounded-full bg-water" />
          {status}
        </span>
      </figcaption>
      <div className="p-4 md:p-5">{children}</div>
    </figure>
  );
}

/** Bullet list in the lab style: a short water-coloured dash per line. */
export function LabBullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-dim">
      {items.map((b) => (
        <li key={b} className="grid grid-cols-[0.9rem_1fr] gap-2">
          <span aria-hidden className="mt-[0.7rem] h-px w-2.5 bg-water" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}
