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
        kicker="Final check before the summit push. Every tool on this list is one I have built with. No percentages: a system is either go or it isn't here."
      />
      <LaunchChecklist />

      <Reveal className="mt-12 md:mt-16">
        <Panel label="Commendations" accent="var(--signal)" className="p-5 md:p-8">
          <ol className="divide-y divide-line">
            {honors.map((h, i) => (
              <li key={h.title} className="grid gap-1 py-4 first:pt-1 last:pb-1 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:items-baseline md:gap-6">
                <span aria-hidden className="font-mono text-[11px] text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-text">{h.title}</p>
                  <p className="mt-0.5 text-sm text-dim">{h.org}</p>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">{h.when}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </Reveal>
    </CampSection>
  );
}
