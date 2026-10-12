import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Expedition } from "./summits/Expedition";

export function Summits() {
  return (
    <CampSection campId="summits" className="pb-8 md:pb-10">
      <SectionHeader
        campId="summits"
        title="Summit Attempts"
        kicker="Gold flags came home with an award; blue markers competed and came back with data. Pick one for the report."
      />
      <Expedition />
    </CampSection>
  );
}
