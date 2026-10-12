import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Chip, Panel } from "@/components/hud/Panel";
import { games, indieGame } from "@/data/content";
import { DuskBackdrop } from "./chautari/DuskBackdrop";
import { CHAUTARI_CSS, PeepalTree } from "./chautari/PeepalTree";
import { LudoTeaser } from "./chautari/LudoTeaser";
import { WarmerTeaser } from "./chautari/WarmerTeaser";
import { Reveal } from "./chautari/Reveal";

const GLOW = "var(--dusk-glow)";
const DUSK_PANEL = { background: "color-mix(in oklab, #140d0a 84%, transparent)" };

export function Chautari() {
  const warmer = games[0];
  return (
    <CampSection campId="chautari" className="overflow-hidden">
      <style>{CHAUTARI_CSS}</style>
      <DuskBackdrop />
      <div className="relative">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <SectionHeader
            campId="chautari"
            title="The Chautari"
            kicker="Where the climb stops for the evening. The light goes warm, and these are the games I make on the side."
          />
          <Reveal delay={0.1} className="hidden lg:block lg:-mb-4">
            <PeepalTree />
          </Reveal>
        </div>

        {/* Featured: Warmer, live */}
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

        {/* Secondary: Chautari Ludo, not deployed */}
        <Reveal className="mt-10 md:mt-12">
          <Panel as="article" label="On the workbench" accent="var(--line-hi)" className="p-5 md:p-6" style={DUSK_PANEL}>
            <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-tight text-text md:text-3xl">
                    {indieGame.title}
                  </h3>
                  <span className="inline-flex items-center gap-2 border border-signal/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                    <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-signal" />
                    {indieGame.status}
                  </span>
                </div>
                <p className="mt-3 text-text/90">{indieGame.tagline}</p>
                <ul className="mt-3 space-y-1.5">
                  {indieGame.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm leading-relaxed text-dim">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: GLOW }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {indieGame.stack.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                  <a
                    href={indieGame.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 inline-flex min-h-8 items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.14em] text-text transition-colors hover:text-[var(--dusk-glow)]"
                  >
                    Source on GitHub <span aria-hidden>↗</span>
                  </a>
                </div>
              </div>
              <div className="md:w-[320px]">
                <p className="hud-label mb-3 !text-[10px]">Try a throw</p>
                <LudoTeaser compact />
              </div>
            </div>
          </Panel>
        </Reveal>
      </div>
    </CampSection>
  );
}
