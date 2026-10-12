import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Expedition } from "./summits/Expedition";

/** Hackathons: the ridge of six events, wins as gold flags, the rest as blue markers. */
export function Summits() {
  return (
    <CampSection campId="summits" className="md:py-28!">
      <SectionHeader
        campId="summits"
        kicker="Gold flags are wins; blue markers are hackathons I competed in. Pick one to read about it."
      />
      <Expedition />
    </CampSection>
  );
}
