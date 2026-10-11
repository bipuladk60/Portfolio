import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Expedition } from "./summits/Expedition";

export function Summits() {
  return (
    <CampSection campId="summits">
      <SectionHeader
        campId="summits"
        title="Summit Attempts"
        kicker="Every hackathon is a climb against a clock. Gold flags came home with an award; blue markers turned back with data gathered. Pick any marker for the full expedition report."
      />
      <Expedition />
    </CampSection>
  );
}
