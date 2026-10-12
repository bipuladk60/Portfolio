import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Expedition } from "./summits/Expedition";

/** Hackathons: the ridge of six events, wins as gold flags, the rest as blue markers. */
export function Summits() {
  return (
    <CampSection campId="hackathons" className="md:py-28!">
      {/* Legacy anchor: keeps old #summits links landing here. */}
      <span id="summits" aria-hidden className="absolute top-0 block scroll-mt-16" />
      <SectionHeader campId="hackathons" />
      <Expedition />
    </CampSection>
  );
}
