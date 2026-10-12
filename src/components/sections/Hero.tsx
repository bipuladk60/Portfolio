import { CampSection } from "@/components/hud/SectionHeader";
import { profile } from "@/data/content";
import { HeroName } from "./hero/HeroName";
import { RouteMap } from "./hero/RouteMap";
import { DualClock } from "./hero/DualClock";
import { ScrollCue } from "./hero/ScrollCue";
import { Reveal } from "./hero/Reveal";
import { ARC_KM } from "./hero/geo";
import { NEPAL_BBOX, NEPAL_PATH, USA_BBOX, USA_PATH } from "./hero/countryPaths";

const [firstName, ...rest] = profile.name.split(" ");
const lastName = rest.join(" ");

function Arrow() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
      <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Camp 00, Ground Station. Full-viewport, deliberately calm: name, live clocks, Nepal -> Mississippi route telemetry. */
export function Hero() {
  return (
    <CampSection campId="base" className="min-h-svh overflow-hidden py-0!">
      <div className="relative z-10 flex min-h-svh flex-col pb-32 pt-24 md:pb-32 md:pt-28">
        <div className="grid flex-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Identity */}
          <div className="min-w-0 lg:col-span-7">
            <Reveal delay={0.25} className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-signal">
              <span aria-hidden className="h-px w-10 bg-signal" />
              {profile.role}
            </Reveal>

            <HeroName
              first={firstName}
              last={lastName}
              className="text-[clamp(3.25rem,14.5vw,7.75rem)] text-text lg:text-[clamp(4rem,8.6vw,8rem)]"
            />

            <Reveal delay={0.9} className="mt-7 max-w-xl">
              <p className="text-lg leading-relaxed text-text/90 md:text-xl">{profile.tagline}</p>
            </Reveal>

            <Reveal delay={1.0} className="mt-6 flex max-w-xl items-start gap-3 border-l-2 border-signal/60 py-1 pl-4">
              <p className="font-mono text-[13px] leading-relaxed text-dim">
                <span className="mr-2 text-signal">STATUS</span>
                {profile.status}
              </p>
            </Reveal>

            <Reveal delay={1.1} className="mt-9 flex flex-wrap gap-3">
              <a
                href="#route"
                className="group inline-flex items-center gap-3 bg-signal px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-bg transition-colors hover:bg-[#ffc93d]"
              >
                View the climb
                <Arrow />
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex items-center gap-3 border border-line-hi px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-text transition-colors hover:border-air hover:text-air"
              >
                Contact
              </a>
            </Reveal>
          </div>

          {/* Route telemetry */}
          <div className="min-w-0 lg:col-span-5">
            <Reveal delay={0.55} y={18}>
              <figure className="min-w-0">
                <RouteMap usaPath={USA_PATH} nepalPath={NEPAL_PATH} usaBox={USA_BBOX} nepalBox={NEPAL_BBOX} />
                <figcaption className="mt-3 font-mono text-[11px] tracking-[0.08em] text-dim">
                  Nepal <span className="text-signal">→</span> Mississippi · {ARC_KM.toLocaleString("en-US")} km great circle
                </figcaption>
              </figure>
              <div className="mt-8">
                <DualClock />
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-9 z-10 flex justify-center md:bottom-10">
        <ScrollCue href="#telemetry" />
      </div>
    </CampSection>
  );
}
