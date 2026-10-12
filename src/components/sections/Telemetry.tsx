import { Fragment } from "react";
import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Surface } from "@/components/hud/Surface";
import { Assemble, AssembleItem } from "@/components/hud/Assemble";
import { degree, education, profile } from "@/data/content";
import { InstrumentCluster } from "./telemetry/Instruments";
import { RouteGlyph } from "./telemetry/RouteGlyph";
import { ARC_KM, HBG, NEPAL, project } from "./hero/geo";
import { NEPAL_BBOX, NEPAL_PATH, USA_BBOX, USA_PATH } from "./hero/countryPaths";

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

const school = education[0];
const firstSchool = education[education.length - 1];

/**
 * About. An instrument cluster (four readings, each with a small visual of the real fact), then one
 * card: the short bio with a Nepal -> Mississippi glyph beside education. Role, status, origin and
 * base live in the hero, so they are not repeated.
 */
export function Telemetry() {
  return (
    <CampSection campId="telemetry" className="pb-10! md:pb-12! md:pt-24!">
      <SectionHeader campId="telemetry" glow className="mb-10 md:mb-12" />

      <Assemble>
        <InstrumentCluster />
      </Assemble>

      <Assemble delay={0.08} className="mt-5 md:mt-6">
        <Surface accent="var(--signal)" className="grid lg:grid-cols-12">
          <AssembleItem className="min-w-0 p-6 md:p-8 lg:col-span-7">
            <div className="max-w-[60ch] space-y-4">
              {profile.about.map((para, i) => (
                <p key={i} className={i === 0 ? "text-lg leading-relaxed text-text md:text-xl" : "leading-relaxed text-text/80 md:text-lg"}>
                  {para}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <RouteGlyph
                nepalPath={NEPAL_PATH}
                usaPath={USA_PATH}
                nepalBox={NEPAL_BBOX}
                usaBox={USA_BBOX}
                nepalXY={project(NEPAL.lon, NEPAL.lat)}
                msXY={project(HBG.lon, HBG.lat)}
                km={ARC_KM}
                from={{ place: profile.origin, note: `${firstSchool.degree.split(",")[0]} · ${firstSchool.when}` }}
                to={{ place: school.where, note: `B.S. · ${degree.graduationLabel}` }}
              />
            </div>
          </AssembleItem>

          <AssembleItem delay={0.35} className="min-w-0 border-t border-line/70 p-6 md:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
            <h3 className="hud-label flex items-center gap-2">
              <span aria-hidden className="h-px w-4 bg-signal" />
              Education
            </h3>
            <ol className="relative mt-6 space-y-7 border-l border-line-hi/70 pl-5">
              {education.map((e, i) => {
                const d = parseDetail(e.detail);
                return (
                  <li key={e.school} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-[25px] top-[7px] h-[9px] w-[9px] rotate-45 border ${i === 0 ? "border-signal bg-signal" : "border-line-hi bg-bg"}`}
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h4 className="font-display text-lg font-semibold leading-tight text-text">{e.school}</h4>
                      <span className="font-mono text-xs text-dim">{e.when}</span>
                    </div>
                    <p className="mt-1.5 text-[15px] text-text/85">{e.degree}</p>
                    <p className="mt-1 font-mono text-xs text-dim">
                      {e.where}
                      {d.gpa && (
                        <>
                          {" · "}
                          <span className="text-signal">GPA {d.gpa}</span>
                        </>
                      )}
                    </p>
                    {d.notes && (
                      <p className="mt-2 text-sm leading-relaxed text-text/70">
                        <span className="sr-only">Coursework: </span>
                        {/* each item keeps its trailing dot, so a wrapped line never starts with "·" */}
                        {d.notes.split(/,\s*/).map((c, j, all) => (
                          <Fragment key={c}>
                            <span className="whitespace-nowrap">
                              {c}
                              {j < all.length - 1 && " ·"}
                            </span>{" "}
                          </Fragment>
                        ))}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </AssembleItem>
        </Surface>
      </Assemble>
    </CampSection>
  );
}
