import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Chip, Panel } from "@/components/hud/Panel";
import { games, indieGame } from "@/data/content";
import { DuskBackdrop } from "./chautari/DuskBackdrop";
import { CHAUTARI_CSS, PeepalTree } from "./chautari/PeepalTree";
import { LudoTeaser } from "./chautari/LudoTeaser";
import { WarmerGlobe } from "./chautari/WarmerGlobe";
import { Reveal } from "./chautari/Reveal";

const GLOW = "var(--dusk-glow)";
const DUSK_PANEL = { background: "color-mix(in oklab, #140d0a 84%, transparent)" };

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/link inline-flex items-center gap-2 border border-[color-mix(in_oklab,var(--dusk-glow)_45%,transparent)] px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-text transition-colors duration-300 hover:border-[var(--dusk-glow)] hover:text-[var(--dusk-glow)]"
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
        ↗
      </span>
    </a>
  );
}

export function Chautari() {
  const warmer = games[0];
  return (
    <CampSection campId="chautari" className="overflow-hidden">
      <style>{CHAUTARI_CSS}</style>
      <DuskBackdrop />
      <div className="relative">
        <SectionHeader
          campId="chautari"
          title="The Chautari"
          kicker="Where the climb stops for the evening. The HUD dims, the light goes warm, and these are the games I build on weekends."
        />

        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Featured indie game */}
          <Reveal className="lg:col-span-6">
            <Panel as="article" label="Featured · Indie game" accent={GLOW} className="p-6 md:p-8" style={DUSK_PANEL}>
              <h3 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-text md:text-5xl">
                {indieGame.title}
              </h3>
              <p className="mt-4 text-lg leading-snug text-text">{indieGame.tagline}</p>
              <p className="mt-4 text-dim">{indieGame.story}</p>

              <dl className="mt-6 grid grid-cols-2 gap-px border border-[color-mix(in_oklab,var(--dusk-glow)_25%,transparent)] bg-[color-mix(in_oklab,var(--dusk-glow)_18%,transparent)]">
                {indieGame.facts.map((f) => (
                  <div key={f.label} className="bg-[#160e0b] px-3 py-3">
                    <dt className="hud-label !text-[10px]">{f.label}</dt>
                    <dd className="mt-1 font-mono text-sm text-text">{f.value}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-6 space-y-3">
                {indieGame.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-relaxed text-dim">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: GLOW }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {indieGame.stack.map((s) => (
                  <Chip key={s} color={GLOW}>
                    {s}
                  </Chip>
                ))}
              </div>
              <div className="mt-7">
                <ExternalLink href={indieGame.repo}>Source on GitHub</ExternalLink>
              </div>
            </Panel>
          </Reveal>

          {/* Tree, platform and the playable teaser */}
          <div className="lg:col-span-6">
            <Reveal delay={0.1}>
              <PeepalTree />
            </Reveal>
            <Reveal delay={0.2} className="-mt-2">
              <Panel label="Try a throw" accent={GLOW} className="p-5 md:p-6" style={DUSK_PANEL}>
                <p className="mb-4 text-sm text-dim">
                  A taste of the board. Roll the die and the red goti hops that many squares along the track.
                </p>
                <LudoTeaser />
              </Panel>
            </Reveal>
          </div>
        </div>

        {/* Warmer */}
        <Reveal className="mt-16 md:mt-24">
          <Panel as="article" label="Daily game · Live" accent={GLOW} className="p-6 md:p-8" style={DUSK_PANEL}>
            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
              <div>
                <WarmerGlobe />
                <div className="mx-auto mt-4 flex max-w-[340px] items-center gap-3" aria-hidden>
                  <span className="hud-label !text-[10px]">Warmer</span>
                  <span
                    className="h-1 flex-1"
                    style={{ background: "linear-gradient(to right, #ff5c5c, #ff9a3c, #f2b418, #8a97a6, #4c8dff)" }}
                  />
                  <span className="hud-label !text-[10px]">Colder</span>
                </div>
              </div>
              <div>
                <h3 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-text md:text-5xl">
                  {warmer.title}
                </h3>
                <p className="mt-4 text-lg leading-snug text-text">{warmer.tagline}</p>
                <ul className="mt-6 space-y-3">
                  {warmer.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-dim">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GLOW }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {warmer.stack.map((s) => (
                    <Chip key={s} color={GLOW}>
                      {s}
                    </Chip>
                  ))}
                </div>
                <div className="mt-7">
                  <ExternalLink href={warmer.href}>Play at warmergames.com</ExternalLink>
                </div>
              </div>
            </div>
          </Panel>
        </Reveal>
      </div>
    </CampSection>
  );
}
