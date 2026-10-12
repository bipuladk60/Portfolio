import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { experience } from "@/data/content";
import { RouteTrack } from "./route/RouteTrack";

/** Experience: roles as a route that draws itself on scroll, oldest first. */
export function RouteLog() {
  return (
    <CampSection campId="route" className="pt-12! md:pt-16!">
      <SectionHeader campId="route" glow className="mb-10 md:mb-14" />
      <RouteTrack entries={experience} />
    </CampSection>
  );
}
