import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { Panel } from "@/components/hud/Panel";
import { honors } from "@/data/content";
import { LaunchChecklist } from "./systems/LaunchChecklist";
import { Reveal } from "./chautari/Reveal";

export function Systems() {
  return (
    <CampSection campId="systems">
      <SectionHeader
        campId="systems"
        title="Systems Check"
        kicker="Final check before the summit. Tools I have built with; no percentages, just go."
      />
      <LaunchChecklist />

      <Reveal className="mt-6">
        <Panel label="Commendations" accent="var(--signal)" className="px-5 pb-4 pt-5">
          <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
            {honors.map((h) => (
              <li key={h.title} className="min-w-0 border-l border-signal/40 pl-3">
                <p className="text-sm leading-snug text-text">{h.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                  {h.org} · {h.when}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
      </Reveal>
    </CampSection>
  );
}
