import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Station } from "./lab/Station";

export function Lab() {
  return (
    <CampSection campId="lab">
      <SectionHeader
        campId="lab"
        title="Atmospheric Lab"
        kicker="Research and machine learning, logged like an air-quality station: what was sampled, how it was processed, and what the instruments read."
      />
      <Station />
    </CampSection>
  );
}
