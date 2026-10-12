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
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* hero sticker */}
          <Reveal className="lg:col-span-7">
            <article data-cursor-box="" className="wr-sticker p-6 md:p-8">
              <p className="wr-pill inline-flex items-center gap-2 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="led absolute inset-0 rounded-full" style={{ background: GREEN }} />
                  <span className="relative inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: INK }} />
                </span>
                {warmer.title} · {warmer.status}
              </p>
              <h3 className="wr-display mt-4 text-5xl font-bold leading-[0.95] md:text-7xl" style={{ color: INK }}>
                {warmer.title}
                <span aria-hidden style={{ color: ORANGE }}>
                  .
                </span>
              </h3>
              <p className="mt-3 text-xl font-bold leading-snug md:text-2xl">{warmer.tagline}</p>
              <p className="mt-3 text-base leading-relaxed opacity-85">{warmer.howItWorks}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href={warmer.href}
                  target="_blank"
                  rel="noreferrer"
                  className="wr-pill wr-press wr-display inline-flex min-h-14 items-center gap-3 !rounded-2xl px-6 py-3 text-lg font-bold md:text-xl"
                  style={{ background: YELLOW, borderWidth: 3, boxShadow: `5px 5px 0 ${INK}` }}
                >
                  Play at warmergames.com
                  <span aria-hidden>→</span>
                </a>
                <span className="text-sm font-bold opacity-70">Free · no sign-up · new country daily</span>
              </div>
            </article>
          </Reveal>

          {/* globe sticker + feature stickers */}
          <div className="flex flex-col gap-6 lg:col-span-5 lg:row-span-2">
            <Reveal delay={0.08}>
              <WarmerTeaser href={warmer.href} />
            </Reveal>
            <Reveal delay={0.12}>
              <div data-cursor-box="" className="wr-sticker p-5">
                <ul className="flex flex-col gap-3">
                  {features.map((f, i) => (
                    <li
                      key={f}
                      className="wr-pill !rounded-2xl px-3.5 py-2 text-sm font-bold leading-snug"
                      style={{ background: CHIP_COLORS[i % CHIP_COLORS.length], rotate: TILTS[i % TILTS.length] }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
                  {warmer.stack.map((s) => (
                    <li key={s} className="rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold" style={{ borderColor: INK }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* analytics sticker */}
          <Reveal className="lg:col-span-7" delay={0.05}>
            <WarmerStats />
            <p className="mt-4 px-1 text-sm font-bold leading-snug">{distribution}</p>
          </Reveal>
        </div>
      </SkyWorld>
    </CampSection>
  );
}
