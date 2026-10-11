import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { profile } from "@/data/content";
import { SummitScene, UPLINK_CSS } from "./uplink/SummitScene";
import { TransmitConsole } from "./uplink/TransmitConsole";
import { Reveal } from "./chautari/Reveal";

export function Uplink() {
  const year = new Date().getFullYear();
  return (
    <CampSection campId="uplink" className="overflow-hidden">
      <style>{UPLINK_CSS}</style>
      <SectionHeader
        campId="uplink"
        title="Summit Uplink"
        kicker="Top of the climb. If you're hiring for new-grad software roles, or just want to talk shop, the channel is open."
      />

      <Reveal>
        <SummitScene />
      </Reveal>

      <Reveal delay={0.1} className="relative -mt-6 md:-mt-12">
        <TransmitConsole />
      </Reveal>

      <footer className="mt-20 border-t border-line pt-8 md:mt-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xl font-semibold uppercase tracking-wide text-air md:text-2xl">
              Signal strong. Transmission open.
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
              © {year} · Built by {profile.name}
            </p>
          </div>
          <div className="space-y-1.5 font-mono text-[11px] tracking-[0.08em] text-dim md:text-right">
            <p>
              Press{" "}
              <kbd className="border border-line-hi px-1.5 py-0.5 font-mono text-[10px] text-text">⌘K</kbd> for the command
              console
            </p>
            <p className="text-dim/80">Say hello the way we do in Kathmandu.</p>
          </div>
        </div>
      </footer>
    </CampSection>
  );
}
