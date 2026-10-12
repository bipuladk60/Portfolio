import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Chip, Panel } from "@/components/hud/Panel";
import { games } from "@/data/content";
import { DuskBackdrop } from "./games/DuskBackdrop";
import { WarmerTeaser } from "./games/WarmerTeaser";
import { Reveal } from "./shared/Reveal";

const GLOW = "var(--dusk-glow)";
const DUSK_PANEL = { background: "color-mix(in oklab, #140d0a 84%, transparent)" };

export function Games() {
  const warmer = games[0];
  return (
    <CampSection campId="games" className="overflow-hidden">
      <DuskBackdrop />
      <div className="relative">
        <SectionHeader
          campId="games"
          title="Game Room"
          kicker="The light goes warm for a minute. This is the game I make on the side, and you can play a round right here."
        />

        <Reveal>
          <Panel as="article" label="Featured game" accent={GLOW} className="p-5 md:p-8" style={DUSK_PANEL}>
            <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
              <div className="md:order-2">
                <p className="hud-label flex items-center gap-2" style={{ color: "var(--water)" }}>
                  <span className="led inline-block h-1.5 w-1.5 rounded-full bg-water" />
                  {warmer.status} · warmergames.com
                </p>
                <h3 className="mt-3 font-display text-4xl font-bold uppercase leading-none tracking-tight text-text md:text-6xl">
                  {warmer.title}
                </h3>
                <p className="mt-3 text-lg leading-snug text-text">{warmer.tagline}</p>
                <p className="mt-3 text-dim">{warmer.howItWorks}</p>
                <ul className="mt-5 space-y-2">
                  {warmer.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-dim">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GLOW }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {warmer.stack.map((s) => (
                    <Chip key={s} color={GLOW}>
                      {s}
                    </Chip>
                  ))}
                </div>
                <a
                  href={warmer.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group/cta mt-7 inline-flex min-h-12 items-center gap-3 border border-[var(--dusk-glow)] bg-[var(--dusk-glow)] px-6 py-3 font-display text-base font-bold uppercase tracking-[0.12em] text-bg transition-colors duration-300 hover:bg-transparent hover:text-[var(--dusk-glow)]"
                >
                  Play at warmergames.com
                  <span aria-hidden className="transition-transform duration-300 group-hover/cta:translate-x-1">
                    ↗
                  </span>
                </a>
              </div>
              <div className="md:order-1">
                <WarmerTeaser href={warmer.href} />
              </div>
            </div>
          </Panel>
        </Reveal>
      </div>
    </CampSection>
  );
}
