import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Chip, Panel } from "@/components/hud/Panel";
import { education, profile, stats } from "@/data/content";
import { Reveal } from "./hero/Reveal";
import { StatGauge } from "./telemetry/StatGauge";

/** Splits an education `detail` string ("GPA x · Coursework: a, b") into labelled dossier fields. */
function parseDetail(detail: string) {
  const parts = detail.split(" · ").map((p) => p.trim()).filter(Boolean);
  let gpa: string | undefined;
  let coursework: string[] = [];
  const notes: string[] = [];
  for (const p of parts) {
    if (/^GPA\s/i.test(p)) gpa = p.replace(/^GPA\s*/i, "");
    else if (/^Coursework:/i.test(p)) coursework = p.replace(/^Coursework:\s*/i, "").split(",").map((c) => c.trim());
    else notes.push(p);
  }
  return { gpa, coursework, notes };
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 border-t border-line py-3 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="hud-label">{label}</dt>
      <dd className="mt-1 text-[15px] leading-snug text-text">{children}</dd>
    </div>
  );
}

/** Camp 01, Telemetry: pilot dossier and the instrument cluster of real stats. */
export function Telemetry() {
  return (
    <CampSection campId="telemetry">
      <SectionHeader
        campId="telemetry"
        title="Telemetry"
        kicker="Pilot dossier and the readings logged on the way up."
      />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Dossier: the wide, document-like column */}
        <Reveal trigger="view" className="min-w-0 lg:col-span-7">
          <Panel as="article" label="Pilot dossier" accent="var(--signal)" className="p-5 pt-7 sm:p-8 sm:pt-9">
            <header className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="hud-label">Subject</p>
                <h3 className="mt-1 font-display text-3xl font-bold uppercase leading-none tracking-tight text-text sm:text-4xl">
                  {profile.name}
                </h3>
              </div>
              <span
                aria-hidden
                className="mt-1 shrink-0 -rotate-6 border-2 border-signal/60 px-2 py-1 text-center font-display text-[10px] font-bold uppercase leading-tight tracking-[0.18em] text-signal/80"
              >
                Cleared
                <br />
                for ascent
              </span>
            </header>

            <dl className="mt-6 grid sm:grid-cols-2 sm:gap-x-8">
              <Field label="Role">{profile.role}</Field>
              <Field label="Callsign">{profile.handle}</Field>
              <Field label="Origin">{profile.origin}</Field>
              <Field label="Base">{profile.base}</Field>
              <Field label="Status" wide>
                <span className="font-mono text-[13px] text-dim">{profile.status}</span>
              </Field>
            </dl>

            <div className="mt-6 border-t border-line pt-5">
              <p className="hud-label text-signal!">Narrative</p>
              <ol className="mt-4 space-y-5">
                {profile.about.map((para, i) => (
                  <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-2 sm:grid-cols-[3rem_1fr]">
                    <span aria-hidden className="pt-1 font-mono text-[11px] tracking-widest text-dim/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-base leading-relaxed text-text/90 md:text-[17px]">{para}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Panel>
        </Reveal>

        {/* Instruments and training record, dropped lower for an off-axis rhythm */}
        <div className="relative min-w-0 lg:col-span-5 lg:pt-20">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 right-0 hidden select-none font-display text-[9rem] font-bold leading-none text-transparent lg:block"
            style={{ WebkitTextStroke: "1px var(--line-hi)" }}
          >
            01
          </span>

          <Reveal trigger="view" delay={0.1} className="relative">
            <Panel label="Instrument cluster" accent="var(--signal)" className="px-3 pb-8 pt-8 sm:px-6">
              <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-2">
                {stats.map((s, i) => (
                  <li key={s.label} className={i % 2 === 1 ? "lg:translate-y-6" : ""}>
                    <StatGauge value={s.value} suffix={s.suffix} label={s.label} index={i} />
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>

          <Reveal trigger="view" delay={0.15} className="mt-12">
            <Panel label="Training record" className="p-5 pt-7 sm:p-6 sm:pt-8">
              <ol className="space-y-6">
                {education.map((e, i) => {
                  const d = parseDetail(e.detail);
                  return (
                    <li key={e.school} className={i > 0 ? "border-t border-dashed border-line-hi pt-6" : ""}>
                      <p className="hud-label">Institution</p>
                      <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-text">{e.school}</h3>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                        <div className="col-span-2">
                          <dt className="hud-label">Degree</dt>
                          <dd className="mt-0.5 text-sm text-text">{e.degree}</dd>
                        </div>
                        <div>
                          <dt className="hud-label">{/^expected/i.test(e.when) ? "Graduation" : "Completed"}</dt>
                          <dd className="mt-0.5 font-mono text-sm text-signal">{e.when}</dd>
                        </div>
                        <div>
                          <dt className="hud-label">Location</dt>
                          <dd className="mt-0.5 font-mono text-sm text-text">{e.where}</dd>
                        </div>
                        {d.gpa && (
                          <div>
                            <dt className="hud-label">GPA</dt>
                            <dd className="mt-0.5 font-mono text-sm text-text">{d.gpa}</dd>
                          </div>
                        )}
                        {d.notes.length > 0 && (
                          <div className="col-span-2">
                            <dt className="hud-label">Notes</dt>
                            <dd className="mt-0.5 text-sm text-dim">{d.notes.join(" · ")}</dd>
                          </div>
                        )}
                      </dl>
                      {d.coursework.length > 0 && (
                        <div className="mt-4">
                          <p className="hud-label">Coursework</p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {d.coursework.map((c) => (
                              <li key={c}>
                                <Chip>{c}</Chip>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Panel>
          </Reveal>
        </div>
      </div>
    </CampSection>
  );
}
