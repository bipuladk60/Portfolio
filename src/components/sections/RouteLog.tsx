import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { experience } from "@/data/content";
import { RouteTrack } from "./route/RouteTrack";

/** Experience: roles as a route that draws itself on scroll, oldest first. */
export function RouteLog() {
  return (
    <CampSection campId="route" className="md:py-28!">
      <SectionHeader campId="route" />
      <RouteTrack entries={experience} />
    </CampSection>
  );
}
