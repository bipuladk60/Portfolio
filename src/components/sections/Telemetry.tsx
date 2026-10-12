import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
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
 * About. One row of gauges, then the short bio beside education. No boxes: whitespace and a single
 * hairline do the separating. Role, status, origin and base live in the hero, so they are not repeated.
 */
export function Telemetry() {
  return (
    <CampSection campId="telemetry" className="md:py-28!">
      <SectionHeader campId="telemetry" />

      <Reveal trigger="view">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4" aria-label="At a glance">
          {stats.map((s, i) => (
            <li key={s.label}>
              <StatGauge value={s.value} suffix={s.suffix} label={s.label} index={i} />
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-16 grid gap-12 border-t border-line pt-12 md:mt-20 md:pt-16 lg:grid-cols-12 lg:gap-16">
        <Reveal trigger="view" delay={0.05} className="min-w-0 lg:col-span-7">
          <div className="max-w-[60ch] space-y-5">
            {profile.about.map((para, i) => (
              <p key={i} className={i === 0 ? "text-lg leading-relaxed text-text md:text-xl" : "leading-relaxed text-text/80 md:text-lg"}>
                {para}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal trigger="view" delay={0.1} className="min-w-0 lg:col-span-5">
          <h3 className="hud-label">Education</h3>
          <ol className="mt-5 space-y-7">
            {education.map((e) => {
              const d = parseDetail(e.detail);
              return (
                <li key={e.school}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h4 className="font-display text-lg font-semibold leading-tight text-text">{e.school}</h4>
                    <span className="font-mono text-xs text-dim">{e.when}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] text-text/85">{e.degree}</p>
                  <p className="mt-1 font-mono text-xs text-dim">
                    {e.where}
                    {d.gpa && <span className="text-text"> · GPA {d.gpa}</span>}
                  </p>
                  {d.notes && <p className="mt-2 text-sm leading-relaxed text-dim">{d.notes}</p>}
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </CampSection>
  );
}
