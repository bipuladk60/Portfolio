import { Fredoka, Nunito } from "next/font/google";
import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { games } from "@/data/content";
import { SkyWorld } from "./games/SkyWorld";
import { WarmerTeaser } from "./games/WarmerTeaser";
import { WarmerStats } from "./games/WarmerStats";
import { GREEN, INK, ORANGE, WARMER_CSS, YELLOW } from "./games/toon";
import { Reveal } from "./shared/Reveal";

// Warmer's own rounded, friendly type, scoped to this section.
const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito", display: "swap" });

const CHIP_COLORS = [YELLOW, "#a8d8ff", GREEN];
const TILTS = ["-1.5deg", "1deg", "-0.6deg"];

export function Games() {
  const warmer = games[0];
  // the last bullet (SEO + visitors) is told by the analytics sticker; the rest become feature stickers
  const features = warmer.bullets.slice(0, -1);
  const distribution = warmer.bullets[warmer.bullets.length - 1];

  return (
    <CampSection campId="games" className={`overflow-hidden ${fredoka.variable} ${nunito.variable}`}>
      <style>{WARMER_CSS}</style>
      <SectionHeader
        campId="games"
        title="Game Room"
        kicker="Step out of the console for a minute. This is Warmer, the game I build and run, and you can play a round right here."
      />

      <SkyWorld>
        <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-7">
          {/* left column: intro + analytics */}
          <div className="flex flex-col gap-5 lg:col-span-7 lg:gap-6">
            <Reveal>
              <article data-cursor-box="" className="wr-sticker p-5 md:p-7">
                <p className="wr-pill inline-flex items-center gap-2 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
                  <span className="relative inline-flex h-2.5 w-2.5">
                    <span className="led absolute inset-0 rounded-full" style={{ background: GREEN }} />
                    <span className="relative inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: INK }} />
                  </span>
                  {warmer.title} · {warmer.status}
                </p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                  <h3 className="wr-display text-5xl font-bold leading-[0.95] md:text-6xl" style={{ color: INK }}>
                    {warmer.title}
                    <span aria-hidden style={{ color: ORANGE }}>
                      .
                    </span>
                  </h3>
                  <a
                    href={warmer.href}
                    target="_blank"
                    rel="noreferrer"
                    className="wr-pill wr-press wr-display inline-flex min-h-12 items-center gap-3 !rounded-2xl px-5 py-2.5 text-base font-bold md:text-lg"
                    style={{ background: YELLOW, borderWidth: 3, boxShadow: `5px 5px 0 ${INK}` }}
                  >
                    Play at warmergames.com
                    <span aria-hidden>→</span>
                  </a>
                </div>
                <p className="mt-3 text-lg font-bold leading-snug md:text-xl">{warmer.tagline}</p>
                <p className="mt-2 text-[15px] leading-relaxed opacity-85">{warmer.howItWorks}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {features.map((f, i) => (
                    <li
                      key={f}
                      className="wr-pill w-fit max-w-full !rounded-xl px-3 py-1.5 text-[13px] font-bold leading-snug"
                      style={{ background: CHIP_COLORS[i % CHIP_COLORS.length], rotate: TILTS[i % TILTS.length], boxShadow: `2px 2px 0 ${INK}`, borderWidth: 2 }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
                  {warmer.stack.map((s) => (
                    <li key={s} className="rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold" style={{ borderColor: INK }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
            <Reveal delay={0.05}>
              <WarmerStats footnote={distribution} />
            </Reveal>
          </div>

          {/* right column: the mini round */}
          <Reveal delay={0.08} className="lg:col-span-5 lg:self-stretch">
            <WarmerTeaser href={warmer.href} />
          </Reveal>
        </div>
      </SkyWorld>
    </CampSection>
  );
}
