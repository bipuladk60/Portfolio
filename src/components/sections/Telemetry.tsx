import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Panel } from "@/components/hud/Panel";
import { education, profile, stats } from "@/data/content";
import { Reveal } from "./hero/Reveal";
import { StatGauge } from "./telemetry/StatGauge";

/** Splits an education `detail` string ("GPA x · a, b, c") into a GPA value and the remaining notes. */
function parseDetail(detail: string) {
  const parts = detail.split(" · ").map((p) => p.trim()).filter(Boolean);
  let gpa: string | undefined;
  const notes: string[] = [];
  for (const p of parts) {
    if (/^GPA\s/i.test(p)) gpa = p.replace(/^GPA\s*/i, "");
    else notes.push(p.replace(/^Coursework:\s*/i, ""));
  }
  return { gpa, notes: notes.join(" · ") };
}

/**
 * Camp 01, Telemetry. Compact by design: one strip of gauges, then the dossier beside the
 * training record. Role, status, origin and base live in the hero, so they are not repeated here.
 */
export function Telemetry() {
  return (
    <CampSection campId="telemetry">
      <SectionHeader campId="telemetry" title="Telemetry" />

      <Reveal trigger="view" className="mb-10">
        <Panel label="Instrument cluster" accent="var(--signal)" className="px-3 pb-5 pt-7 sm:px-6">
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4">
            {stats.map((s, i) => (
              <li key={s.label}>
                <StatGauge value={s.value} suffix={s.suffix} label={s.label} index={i} />
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <Reveal trigger="view" delay={0.05} className="min-w-0 lg:col-span-7">
          <Panel as="article" label="Pilot dossier" accent="var(--signal)" className="h-full p-5 pt-7 sm:p-7 sm:pt-8">
            <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="min-w-0">
                <p className="hud-label">Subject · Callsign {profile.handle}</p>
                <h3 className="mt-1 font-display text-2xl font-bold uppercase leading-none tracking-tight text-text sm:text-3xl">
                  {profile.name}
                </h3>
              </div>
              <span
                aria-hidden
                className="shrink-0 -rotate-6 border-2 border-signal/60 px-2 py-1 text-center font-display text-[10px] font-bold uppercase leading-tight tracking-[0.18em] text-signal/80"
              >
                Cleared
                <br />
                for ascent
              </span>
            </header>
            <ol className="mt-4 space-y-3">
              {profile.about.map((para, i) => (
                <li key={i} className="grid grid-cols-[2rem_1fr] gap-2">
                  <span aria-hidden className="pt-1 font-mono text-[11px] tracking-widest text-dim/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="leading-relaxed text-text/90">{para}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </Reveal>

        <Reveal trigger="view" delay={0.1} className="min-w-0 lg:col-span-5">
          <Panel label="Training record" accent="var(--text-dim)" className="h-full p-5 pt-7 sm:p-6 sm:pt-8">
            <ol className="space-y-4">
              {education.map((e, i) => {
                const d = parseDetail(e.detail);
                return (
                  <li key={e.school} className={i > 0 ? "border-t border-dashed border-line-hi pt-4" : ""}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="font-display text-base font-semibold leading-tight text-text">{e.school}</h3>
                      <span className="font-mono text-xs text-signal">{e.when}</span>
                    </div>
                    <p className="mt-1 text-sm text-text/85">{e.degree}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
                      {e.where}
                      {d.gpa && <span className="text-text"> · GPA {d.gpa}</span>}
                    </p>
                    {d.notes && <p className="mt-2 text-[13px] leading-snug text-dim">{d.notes}</p>}
                  </li>
                );
              })}
            </ol>
          </Panel>
        </Reveal>
      </div>
    </CampSection>
  );
}
