import { mlWork } from "@/data/content";

/** Smaller ML projects as a light list: no cards, one hairline between rows. */
export function OtherMl() {
  return (
    <div>
      <h3 className="hud-label">Other ML work</h3>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {mlWork.map((w) => (
          <li key={w.title} className="grid gap-x-8 gap-y-1.5 py-4 md:grid-cols-[5rem_minmax(0,1fr)_auto] md:items-baseline">
            <span className="font-mono text-xs text-dim">{w.when}</span>
            <div className="min-w-0">
              <h4 className="font-display text-base font-semibold text-text">{w.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-dim">{w.detail}</p>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs md:justify-end">
              {w.metrics.map((m) => (
                <span key={m.label} className="text-dim">
                  {m.label} <span className="text-water tabular-nums">{m.value}</span>
                </span>
              ))}
              {"href" in w && w.href && (
                <a
                  href={w.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky underline-offset-4 hover:underline"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
