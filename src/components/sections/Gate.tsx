import { CampSection } from "@/components/hud/SectionHeader";
import { GateRound } from "./gate/GateRound";

// Pre-paint visibility from html[data-chapter] (set by the boot script), so returning visitors
// see the cleared strip immediately and new visitors see the round. Without JS neither attribute
// exists: the round shows (static) and the strip stays hidden.
const GATE_CSS = `
.gate-strip { display: none; }
html[data-chapter="2"] .gate-strip { display: block; }
html[data-chapter="2"] .gate-full { display: none; }
html[data-chapter="2"] #gate { padding-top: 1.5rem; padding-bottom: 1.5rem; }
`;

export function Gate() {
  return (
    <CampSection campId="gate">
      <style>{GATE_CSS}</style>
      <GateRound />
    </CampSection>
  );
}
