import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Expedition } from "./summits/Expedition";

/** Hackathons: the ridge of six events, wins as gold flags, the rest as blue markers. */
export function Summits() {
  return (
    <CampSection campId="hackathons" className="md:py-28!">
      {/* Legacy anchor: keeps old #summits links landing here. */}
      <span id="summits" aria-hidden className="absolute top-0 block scroll-mt-16" />
      {/* a low amber glow behind the heading and the ridge, the colour of the wins */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 70%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 70%, transparent)",
          background:
            "radial-gradient(ellipse 45% 40% at 18% 12%, color-mix(in oklab, var(--signal) 7%, transparent), transparent 70%), radial-gradient(ellipse 50% 45% at 35% 62%, color-mix(in oklab, var(--signal) 4%, transparent), transparent 70%)",
        }}
      />
      <SectionHeader campId="hackathons" />
      <Expedition />
    </CampSection>
  );
}
