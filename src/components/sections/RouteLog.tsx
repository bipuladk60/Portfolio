import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { experience } from "@/data/content";
import { RouteTrack } from "./route/RouteTrack";

/** Experience: roles as a route that draws itself on scroll, oldest first. */
export function RouteLog() {
  return (
    <CampSection campId="route" className="md:py-28!">
      <SectionHeader
        campId="route"
        kicker="Oldest first. Gulf South, the gold line on the left, ran the whole way through, alongside CadenceAI and then Illumibot."
      />
      <RouteTrack entries={experience} />
    </CampSection>
  );
}
