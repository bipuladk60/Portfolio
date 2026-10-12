import { CampSection } from "@/components/hud/SectionHeader";
import { honors } from "@/data/content";
import { GREEN, INK, ORANGE, RED, WARMER_CSS, YELLOW } from "@/components/toon/toon";
import { ToonHeader } from "./shared/ToonHeader";
import { ToonSky } from "./shared/ToonSky";
import { SKY } from "./shared/sky";
import { Reveal } from "./shared/Reveal";
import { Rosette, SkillSheets } from "./systems/SkillSheets";

// Server-side copy of the ribbon palette (the client module's helpers can't be called from a server component).
const RIBBONS = [ORANGE, RED, GREEN, YELLOW];
const ribbonColor = (i: number) => RIBBONS[i % RIBBONS.length];

export function Systems() {
  return (
    <CampSection campId="systems" className="overflow-hidden">
      <style>{WARMER_CSS}</style>
      <ToonSky from={SKY[1]} to={SKY[2]} seed={81} clouds={3} />
      <div className="wr-world relative">
        <ToonHeader campId="systems" title="Skills" dot={GREEN} kicker="Tools I have built with. No percentages, just stickers." />
        <SkillSheets />

        <Reveal className="mt-10">
          <h3 className="wr-display text-2xl font-bold" style={{ color: INK }}>
            Honors
          </h3>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {honors.map((h, i) => (
              <li
                key={h.title}
                data-cursor-box=""
                className="wr-pill wr-wobble flex items-center gap-3 !rounded-2xl bg-white py-3 pl-2 pr-4"
              >
                <Rosette color={ribbonColor(i)} className="h-14 w-11 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] font-extrabold leading-snug">{h.title}</p>
                  <p className="mt-0.5 text-xs font-bold opacity-70">
                    {h.org} · {h.when}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </CampSection>
  );
}
