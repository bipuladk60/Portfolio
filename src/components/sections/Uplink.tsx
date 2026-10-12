import { CampSection } from "@/components/hud/SectionHeader";
import { profile } from "@/data/content";
import { INK, WARMER_CSS, YELLOW } from "@/components/toon/toon";
import { ToonHeader } from "./shared/ToonHeader";
import { ToonSky } from "./shared/ToonSky";
import { SKY } from "./shared/sky";
import { Reveal } from "./shared/Reveal";
import { FlagLine, UPLINK_CSS } from "./uplink/FlagLine";
import { Hills } from "./uplink/Hills";
import { TransmitConsole } from "./uplink/TransmitConsole";

export function Uplink() {
  const year = new Date().getFullYear();
  return (
    <CampSection campId="uplink" className="overflow-hidden !pb-0">
      <style>{WARMER_CSS + UPLINK_CSS}</style>
      <ToonSky from={SKY[2]} to={SKY[3]} seed={88} clouds={3}>
        <Hills />
      </ToonSky>
      <div className="wr-world relative">
        <ToonHeader
          campId="uplink"
          title="Get in touch"
          dot={YELLOW}
          kicker="Open to new-grad software engineering roles. The fastest way to reach me is email."
        />

        <Reveal>
          <div className="-mb-3 px-3 md:px-6">
            <FlagLine />
          </div>
          <TransmitConsole />
        </Reveal>

        <footer className="relative mt-12 flex flex-col gap-3 pb-28 md:mt-16 md:flex-row md:items-end md:justify-between md:pb-36">
          <div>
            <p className="wr-display text-2xl font-bold md:text-3xl" style={{ color: INK }}>
              Say hello the way we do in Nepal.
            </p>
            <p className="mt-1 text-sm font-bold opacity-75">
              © {year} · Built by {profile.name}
            </p>
          </div>
          <p className="text-sm font-bold">
            Press{" "}
            <kbd className="wr-pill bg-white px-2 py-0.5 font-sans text-xs font-extrabold" style={{ borderWidth: 2, boxShadow: `2px 2px 0 ${INK}` }}>
              ⌘K
            </kbd>{" "}
            for the command console
          </p>
        </footer>
      </div>
    </CampSection>
  );
}
